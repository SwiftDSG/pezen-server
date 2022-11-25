import { CronJob } from 'cron'
import { InsertOneResult, ObjectId } from "mongodb";
import { findOrderById } from '../connectors/orders/find-by-id';
import { updateOrder } from '../connectors/orders/update';

import { createTask } from "../connectors/tasks/create";
import { deleteTask } from '../connectors/tasks/delete';
import { findTaskByQuery } from '../connectors/tasks/find-by-query';
import { getTaskExpired } from '../connectors/tasks/get-expired';
import { getTaskValid } from '../connectors/tasks/get-valid';
import { Order, OrderStatus } from '../interfaces/order';
import { Task, TaskBase, TaskType } from "../interfaces/task";

interface OrderMetadata {
  _id: ObjectId
  status_type?: OrderStatus['type']
  code?: string
}

const taskTypes: TaskType[] = ['CANCEL_EMAIL_VERIFICATION', 'CANCEL_ORDER']

const jobs: {
  _id: ObjectId,
  job: CronJob
}[] = []

const tasks: { [k in TaskType]: (metadata: any) => Promise<void> } = {
  'CANCEL_EMAIL_VERIFICATION': async (metadata: { email: string }): Promise<void> => {
    const task: Task = await findTaskByQuery({
      metadata: {
        email: metadata.email
      }
    })

    if (task) await removeTask(task)
  },
  'CANCEL_ORDER': async (metadata: OrderMetadata): Promise<void> => {
    const order: Order = await findOrderById(metadata._id)

    if (order.status[0].type !== 'unpaid')
      throw new Error('DELETE_TASK')

    order.status.unshift({
      type: 'ignored',
      date: new Date()
    })

    const task: Task = await findTaskByQuery({ metadata })

    if (task) {
      await removeTask(task)
      await updateOrder(order)
    }

  }
}

export async function addTask<T>(type: TaskType, date: Date, metadata?: T): Promise<void> {
  if (!taskTypes.includes(type)) throw new Error('TASK_MUST_HAVE_VALID_TYPE')

  const payload: TaskBase = {
    type,
    date,
    metadata
  }

  const { insertedId: newTaskId }: InsertOneResult = await createTask(payload)

  jobs.push({
    _id: newTaskId,
    job: new CronJob(date, () => {
      tasks[type](metadata)
    }, null, true)
  })
}

export async function removeTask(task: Task): Promise<void> {
  const index: number = jobs.findIndex((a) => a._id === task._id)
  if (index > -1) {
    if (jobs?.[index].job?.running) jobs[index].job.stop()
    jobs.splice(index, 1)
  }

  await deleteTask(task)
}

export async function loadTasks(): Promise<void> {
  const validTasks: Task[] = await getTaskValid()
  const expiredTasks: Task[] = await getTaskExpired()

  if (expiredTasks?.length) {
    for (const task of expiredTasks) {
      tasks[task.type](task.metadata)
    }
  }
  if (validTasks?.length) {
    for (const task of validTasks) {
      jobs.push({
        _id: task._id,
        job: new CronJob(task.date, () => {
          tasks[task.type](task.metadata)
        }, null, true)
      })
    }
  }

  new CronJob('0 0 * * * *', refreshTasks)
}

export async function refreshTasks(): Promise<void> {
  const expiredTasks: Task[] = await getTaskExpired()

  if (expiredTasks?.length) {
    for (const task of expiredTasks) {
      tasks[task.type](task.metadata)
    }
  }
}
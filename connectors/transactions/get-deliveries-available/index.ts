import { AggregationCursor, ObjectId, Document } from "mongodb"

import { collections } from "../../../plugins/connections"
import { TransactionDelivery } from "../../../interfaces/transaction"

export async function getTransactionAvailableDeliveries(_id: ObjectId): Promise<TransactionDelivery[]> {
  const pipeline: Document[] = [
    {
      $match: {
        $expr: {
          $eq: ['$_id', _id]
        }
      }
    },
    {
      $project: {
        _id: 0,
        delivery: {
          $map: {
            input: '$delivery',
            as: 'delivery',
            in: {
              document_id: '$$delivery.document_id',
              user: '$$delivery.user',
              date: '$$delivery.date',
              item: {
                $map: {
                  input: '$$delivery.item',
                  in: {
                    _id: '$$this._id',
                    quantity: '$$this.quantity',
                    price: {
                      $arrayElemAt: ['$item.price', {
                        $indexOfArray: ['$item._id', '$$this._id']
                      }]
                    },
                    discount: {
                      $arrayElemAt: ['$item.discount', {
                        $indexOfArray: ['$item._id', '$$this._id']
                      }]
                    }
                  }
                }
              },
            }
          }
        },
        document_id: {
          $cond: [
            '$payment',
            {
              $reduce: {
                input: '$payment',
                initialValue: [],
                in: {
                  $concatArrays: ['$$value', '$$this.document_id']
                }
              }
            },
            []
          ]
        }
      }
    },
    {
      $lookup: {
        from: 'documents',
        as: 'documents',
        let: {
          document_id: '$document_id'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $in: ['$_id', '$$document_id']
                  },
                  {
                    $eq: ['$type', 'invoice']
                  }
                ]
              }
            }
          },
          {
            $addFields: {
              delivery_document: {
                $filter: {
                  input: '$reference',
                  cond: {
                    $eq: ['$$this.type', 'delivery_document']
                  }
                }
              }
            }
          },
          {
            $project: {
              delivery_document: {
                $reduce: {
                  input: '$delivery_document',
                  initialValue: [],
                  in: {
                    $concatArrays: ['$$value', ['$$this._id']]
                  }
                }
              }
            }
          }
        ]
      }
    },
    {
      $project: {
        delivery: '$delivery',
        document_id: {
          $reduce: {
            input: '$documents',
            initialValue: [],
            in: {
              $concatArrays: ['$$value', '$$this.delivery_document']
            }
          }
        }
      }
    },
    {
      $project: {
        delivery: {
          $filter: {
            input: '$delivery',
            cond: {
              $ne: [
                {
                  $in: [{
                    $arrayElemAt: ['$$this.document_id', 0]
                  }, '$document_id']
                },
                true
              ]
            }
          }
        }
      }
    },
    {
      $unwind: '$delivery'
    },
    {
      $lookup: {
        from: 'documents',
        as: 'document',
        let: {
          document_id: {
            $arrayElemAt: ['$delivery.document_id', 0]
          }
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$document_id']
              }
            }
          },
          {
            $project: {
              number: '$number'
            }
          }
        ]
      }
    },
    {
      $project: {
        _id: 0,
        item: '$delivery.item',
        user: '$delivery.user',
        date: '$delivery.date',
        document: {
          $arrayElemAt: ['$document', 0]
        }
      }
    }
  ]

  const payload: TransactionDelivery[] = []
  const cursor: AggregationCursor<TransactionDelivery> = collections.transactions.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload
}
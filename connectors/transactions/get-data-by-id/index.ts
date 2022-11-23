import { Document, AggregationCursor, ObjectId } from "mongodb"

import { collections } from "../../../plugins/connections"
import { TransactionResponse } from "../../../interfaces/transaction"

export async function getTransactionDataById(_id: ObjectId): Promise<TransactionResponse> {
  const pipeline: Document[] = []

  pipeline.push({
    $match: {
      $expr: {
        $eq: ['$_id', _id]
      }
    }
  }, {
    $lookup: {
      from: 'customers',
      as: 'customers',
      let: {
        subject_id: '$subject_id'
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$subject_id']
            }
          }
        },
        {
          $project: {
            _id: '$_id',
            name: '$name'
          }
        }
      ]
    }
  }, {
    $lookup: {
      from: 'suppliers',
      as: 'suppliers',
      let: {
        subject_id: '$subject_id'
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$subject_id']
            }
          }
        },
        {
          $project: {
            _id: '$_id',
            name: '$name'
          }
        }
      ]
    }
  }, {
    $lookup: {
      from: 'products',
      as: 'products',
      let: {
        product_ids: {
          $map: {
            input: '$item',
            in: '$$this._id'
          }
        },
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ['$_id', '$$product_ids']
            }
          }
        },
        {
          $project: {
            name: '$name',
            price: '$price'
          }
        }
      ]
    }
  }, {
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
              $eq: ['$_id', '$$document_id']
            }
          }
        },
        {
          $project: {
            _id: '$_id',
            type: '$type',
            number: '$number',
            file_url: '$file_url',
          }
        }
      ]
    }
  }, {
    $addFields: {
      purchase_order: {
        $arrayElemAt: ['$documents', 0]
      },
      item: {
        $map: {
          input: '$item',
          in: {
            _id: '$$this._id',
            quantity: '$$this.quantity',
            discount: {
              $cond: [
                { $eq: ['$type', 'sale'] },
                '$$this.discount',
                0
              ]
            },
            price: {
              $cond: [
                { $eq: ['$type', 'sale'] },
                {
                  $arrayElemAt: [
                    '$products.price',
                    {
                      $indexOfArray: ['$products._id', '$$this._id']
                    }
                  ]
                },
                '$$this.price'
              ]
            },
            name: {
              $arrayElemAt: [
                '$products.name',
                {
                  $indexOfArray: ['$products._id', '$$this._id']
                }
              ]
            }
          }
        }
      },
      reversed_status: {
        $reverseArray: '$status'
      },
      payment: {
        $cond: ['$payment', '$payment', []]
      },
      delivery: {
        $cond: ['$delivery', '$delivery', []]
      },
    }
  }, {
    $addFields: {
      activity: {
        $concatArrays: [
          {
            $map: {
              input: '$reversed_status',
              in: {
                type: 'status',
                date: '$$this.date',
                user: '$$this.user',
                message: '$$this.message',
                status_type: '$$this.type'
              }
            }
          },
          {
            $map: {
              input: '$delivery',
              in: {
                type: 'delivery',
                date: '$$this.date',
                user: '$$this.user',
                document_id: '$$this.document_id'
              }
            }
          },
          {
            $map: {
              input: '$payment',
              in: {
                type: 'create-payment',
                date: '$$this.date',
                user: '$$this.user',
                document_id: '$$this.document_id'
              }
            }
          },
          {
            $map: {
              input: {
                $reduce: {
                  input: '$payment',
                  initialValue: [],
                  in: {
                    $concatArrays: ['$$value', '$$this.status']
                  }
                }
              },
              in: {
                type: {
                  $cond: [
                    '$$this.amount',
                    'fulfill-payment',
                    'warn-payment'
                  ]
                },
                amount: '$$this.amount',
                date: '$$this.date',
                user: '$$this.user',
                file_url: '$$this.file_url',
                document_id: '$$this.document_id'
              }
            }
          }
        ]
      },
    }
  }, {
    $addFields: {
      documents_id: {
        $reduce: {
          input: {
            $filter: {
              input: '$activity',
              cond: {
                $arrayElemAt: ['$$this.document_id', 0]
              }
            }
          },
          initialValue: [],
          in: {
            $concatArrays: ['$$value', '$$this.document_id']
          }
        }
      }
    }
  }, {
    $lookup: {
      from: 'documents',
      as: 'documents',
      let: {
        document_id: '$documents_id'
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ['$_id', '$$document_id']
            }
          }
        }
      ]
    }
  }, {
    $project: {
      _id: '$_id',
      branch_id: '$branch_id',
      type: '$type',
      sub_total: '$sub_total',
      total: '$total',
      tax: '$tax',
      subject: {
        $cond: [
          { $arrayElemAt: ['$customers', 0] },
          { $arrayElemAt: ['$customers', 0] },
          { $arrayElemAt: ['$suppliers', 0] }
        ]
      },
      purchase_order: '$purchase_order',
      item: '$item',
      status: '$status',
      activity: {
        $sortArray: {
          input: {
            $map: {
              input: '$activity',
              as: 'activity',
              in: {
                message: '$$activity.message',
                type: '$$activity.type',
                date: '$$activity.date',
                user: '$$activity.user',
                status_type: '$$activity.status_type',
                document: {
                  $cond: [
                    '$$activity.document_id',
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: '$documents',
                            as: 'document',
                            cond: {
                              $in: ['$$document._id', '$$activity.document_id']
                            }
                          }
                        },
                        as: 'document_raw',
                        in: {
                          _id: '$$document_raw._id',
                          type: '$$document_raw.type',
                          number: '$$document_raw.number',
                          file_url: '$$document_raw.file_url'
                        }
                      }
                    },
                    null
                  ]
                }
              }
            }
          },
          sortBy: { date: 1 }
        }
      },
      create_date: '$create_date',
    }
  })

  const payload: TransactionResponse[] = []
  const cursor: AggregationCursor<TransactionResponse> = collections.transactions.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }
  return payload[0]
}
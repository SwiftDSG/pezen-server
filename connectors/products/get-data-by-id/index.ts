import { AggregationCursor, Document, ObjectId } from "mongodb";

import { collections } from "../../../plugins/connections";
import { ProductResponse } from "../../../interfaces/product";

export async function getProductDataById(_id: ObjectId): Promise<ProductResponse> {
  const pipeline: Document[] = [
    {
      $match: {
        $expr: {
          $eq: ['$_id', _id]
        }
      }
    },
    {
      $lookup: {
        from: 'product-activities',
        let: {
          product_id: _id
        },
        as: 'activities',
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$product_id', '$$product_id']
              }
            }
          },
          {
            $lookup: {
              from: 'transactions',
              let: {
                transaction_id: '$transaction_id'
              },
              as: 'transactions',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$transaction_id']
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'documents',
                    let: {
                      document_id: '$document_id'
                    },
                    as: 'documents',
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $eq: ['$_id', '$$document_id']
                          }
                        }
                      }
                    ]
                  }
                },
                {
                  $project: {
                    _id: '$_id',
                    document: {
                      _id: { $arrayElemAt: ['$documents._id', 0] },
                      number: { $arrayElemAt: ['$documents.number', 0] },
                    }
                  }
                }
              ]
            }
          },
          {
            $sort: {
              date: -1
            }
          },
          {
            $project: {
              _id: '$_id',
              type: '$type',
              date: '$date',
              user: '$user',
              branch_id: '$branch_id',
              quantity: {
                $reduce: {
                  input: '$stock',
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this.quantity'] }
                }
              },
              transaction: {
                _id: { $arrayElemAt: ['$transactions._id', 0] },
                document: { $arrayElemAt: ['$transactions.document', 0] }
              },
            },
          },
          {
            $group: {
              _id: '$branch_id',
              datas: {
                $push: '$$ROOT'
              }
            }
          },
          {
            $lookup: {
              from: 'branches',
              let: {
                branch_id: '$_id'
              },
              as: 'branch',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$branch_id']
                    }
                  }
                },
                {
                  $project: {
                    _id: '$_id',
                    name: '$name',
                    code: '$code',
                  }
                }
              ]
            }
          },
          {
            $project: {
              _id: 0,
              branch: {
                $arrayElemAt: ['$branch', 0]
              },
              datas: '$datas'
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'product-stocks',
        let: {
          product_id: _id
        },
        as: 'stocks',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$product_id', '$$product_id'] },
                  { $gt: ['$remaining', 0] }
                ]
              }
            }
          },
          {
            $project: {
              _id: '$_id',
              branch_id: '$branch_id',
              create_date: '$create_date',
              quantity: '$quantity',
              remaining: '$remaining',
              price: '$price',
            }
          },
          {
            $group: {
              _id: '$branch_id',
              datas: {
                $push: '$$ROOT'
              }
            }
          },
          {
            $lookup: {
              from: 'branches',
              let: {
                branch_id: '$_id'
              },
              as: 'branch',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$_id', '$$branch_id']
                    }
                  }
                },
                {
                  $project: {
                    _id: '$_id',
                    name: '$name',
                    code: '$code',
                  }
                }
              ]
            }
          },
          {
            $project: {
              _id: 0,
              branch: {
                $arrayElemAt: ['$branch', 0]
              },
              datas: '$datas'
            }
          }
        ]
      }
    },
    {
      $project: {
        _id: '$_id',
        sku: '$sku',
        name: '$name',
        price: '$price',
        category: '$category',
        image_url: '$image_url',
        stock: {
          remaining: {
            $map: {
              input: '$stocks',
              as: 'stock',
              in: {
                branch: '$$stock.branch',
                value: {
                  $reduce: {
                    input: '$$stock.datas',
                    initialValue: 0,
                    in: {
                      $add: ['$$value', '$$this.remaining']
                    }
                  }
                }
              }
            }
          },
          available: '$stocks',
          activity: '$activities'
        }
      }
    }
  ]

  const payload: ProductResponse[] = []
  const cursor: AggregationCursor<ProductResponse> = collections.products.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }

  return payload[0]
}
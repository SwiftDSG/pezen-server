import { AggregationCursor, Document } from "mongodb";

import { RestaurantMenusResponse } from "../../../interfaces/restaurant";
import { collections } from "../../../plugins/connections";

export async function getRestaurantDataMenusByCode(code: string, type: 'dine-in' | 'pre-order'): Promise<RestaurantMenusResponse> {
  const pipeline: Document[] = [
    {
      $match: {
        $expr: {
          $eq: ['$code', code]
        }
      }
    },
    {
      $lookup: {
        from: 'promos',
        let: {
          r_id: '$_id'
        },
        as: 'promos',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      '$r_id',
                      { $toString: '$$r_id' }
                    ]
                  },
                  {
                    $eq: ['$type', 'menu-promo']
                  },
                  {
                    $or: [
                      {
                        $and: [
                          { $eq: ['$start_date', null] },
                          { $eq: ['$end_date', null] },
                        ]
                      },
                      {
                        $and: [
                          { $gte: [{ $toDate: new Date() }, { $toDate: '$start_date' }] },
                          { $lte: [{ $toDate: new Date() }, { $toDate: '$end_date' }] }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          },
          {
            $unwind: '$m_ids'
          },
          {
            $group: {
              _id: '$m_ids',
              p_ids: {
                $addToSet: '$_id'
              },
              amount: {
                $addToSet: {
                  $subtract: [
                    1,
                    '$amount'
                  ]
                }
              }
            }
          },
          {
            $project: {
              p_ids: '$p_ids',
              amount: {
                $reduce: {
                  input: '$amount',
                  initialValue: 1,
                  in: {
                    $multiply: ['$$value', '$$this']
                  }
                }
              }
            }
          },
        ]
      }
    },
  ]

  if (type === 'dine-in') {
    pipeline.push({
      $lookup: {
        from: 'menus',
        let: {
          r_id: '$_id',
          promos: '$promos'
        },
        as: 'dine_in',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      '$r_id',
                      { $toString: '$$r_id' }
                    ]
                  },
                  {
                    $or: [{ $eq: ['$type', 'dine-in'] }, { $eq: ['$type', 'regular'] }]
                  },
                  {
                    $or: [
                      { $eq: ['$status', 'active'] },
                      { $eq: ['$status', 'out-of-stock'] }
                    ]
                  }
                ]
              }
            }
          },
          {
            $addFields: {
              eligible_promos: {
                $filter: {
                  input: '$$promos',
                  as: 'promo',
                  cond: {
                    $eq: ['$$promo._id', { $toString: '$_id' }]
                  }
                }
              }
            }
          },
          {
            $project: {
              eligible_promos: { $arrayElemAt: ['$eligible_promos', 0] },
              pic_url: '$pic_url',
              name: '$name',
              category: '$category',
              description: '$desc',
              status: '$status',
              price: '$price',
              markup_price: '$markup_price',
              portion: '$portion',
              new_price: {
                $cond: [
                  {
                    $eq: [
                      { $toString: '$_id' },
                      { $arrayElemAt: ['$eligible_promos._id', 0] }
                    ]
                  },
                  {
                    $multiply: [
                      '$price',
                      { $arrayElemAt: ['$eligible_promos.amount', 0] }
                    ]
                  },
                  null
                ]
              }
            }
          },
          {
            $group: {
              _id: '$category',
              menus: { $push: '$$ROOT' }
            }
          },
          {
            $addFields: {
              category: '$_id'
            }
          },
          {
            $project: {
              _id: 0
            }
          }
        ]
      }
    }, {
      $project: {
        categories: '$dine_in'
      }
    })
  } else {
    pipeline.push({
      $lookup: {
        from: 'menu-packs',
        let: {
          r_id: '$_id'
        },
        as: 'menu_packs',
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      '$r_id',
                      { $toString: '$$r_id' }
                    ]
                  },
                  { $lte: [{ $toDate: new Date() }, { $toDate: '$date' }] }
                ]
              }
            }
          },
          {
            $project: {
              _id: '$_id',
              date: '$date',
              items: {
                $map: {
                  input: '$items',
                  as: 'item',
                  in: {
                    $mergeObjects: [
                      '$$item',
                      {
                        date: '$date',
                        m_id: '$_id'
                      }
                    ]
                  }
                }
              }
            }
          }
        ]
      }
    },
      {
        $lookup: {
          from: 'menus',
          let: {
            r_id: '$_id',
            promos: '$promos'
          },
          as: 'pre_order',
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        '$r_id',
                        { $toString: '$$r_id' }
                      ]
                    },
                    {
                      $or: [{ $eq: ['$type', 'pre-order'] }, { $eq: ['$type', 'regular'] }]
                    },
                    {
                      $or: [
                        { $eq: ['$status', 'active'] },
                        { $eq: ['$status', 'out-of-stock'] }
                      ]
                    }
                  ]
                }
              }
            },
            {
              $addFields: {
                eligible_promos: {
                  $filter: {
                    input: '$$promos',
                    as: 'promo',
                    cond: {
                      $eq: ['$$promo._id', { $toString: '$_id' }]
                    }
                  }
                }
              }
            },
            {
              $project: {
                eligible_promos: { $arrayElemAt: ['$eligible_promos', 0] },
                pic_url: '$pic_url',
                name: '$name',
                category: '$category',
                description: '$desc',
                status: '$status',
                price: '$price',
                markup_price: '$markup_price',
                portion: '$portion',
                make_duration: '$make_duration',
                new_price: {
                  $cond: [
                    {
                      $eq: [
                        { $toString: '$_id' },
                        { $arrayElemAt: ['$eligible_promos._id', 0] }
                      ]
                    },
                    {
                      $multiply: [
                        '$price',
                        { $arrayElemAt: ['$eligible_promos.amount', 0] }
                      ]
                    },
                    null
                  ]
                }
              }
            },
            {
              $group: {
                _id: '$category',
                menus: { $push: '$$ROOT' }
              }
            },
            {
              $addFields: {
                category: '$_id'
              }
            },
            {
              $project: {
                _id: 0
              }
            }
          ]
        }
      }, {
      $project: {
        categories: '$pre_order',
        packs: '$menu_packs'
      }
    })
  }

  const payload: RestaurantMenusResponse[] = []
  const cursor: AggregationCursor<RestaurantMenusResponse> = collections.restaurants.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }

  return payload[0]
}
import { AggregationCursor, Document } from "mongodb";

import { RestaurantDetailResponse } from "../../../interfaces/restaurant";
import { collections } from "../../../plugins/connections";

export async function getRestaurantDataByCode(code: string, position?: { lat: number, lng: number }, courier?: boolean): Promise<RestaurantDetailResponse> {
  const pipeline: Document[] = [
    {
      $match: {
        $expr: {
          $eq: ['$code', code]
        }
      }
    },
    {
      $project: {
        finance: 0,
        members: 0,
        subscriptions: 0,
        deleted: 0
      }
    }
  ]

  if (position?.lat && position?.lng) {
    pipeline.unshift({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [position.lng, position.lat]
        },
        spherical: true,
        distanceField: 'dist',
      }
    })
  }

  if (courier) {
    pipeline.push(
      {
        $lookup: {
          from: 'couriers',
          let: {
            c_ids: {
              $map: {
                input: '$couriers',
                as: 'courier',
                in: '$$courier._id'
              }
            }
          },
          as: 'couriers',
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [{ $toString: '$_id' }, '$$c_ids']
                }
              }
            },
            {
              $lookup: {
                from: 'courier-services',
                let: {
                  c_id: { $toString: '$_id' }
                },
                as: 'services',
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$c_id', '$$c_id']
                      }
                    }
                  }
                ]
              }
            },
          ]
        }
      }
    )
  } else {
    pipeline.push(
      {
        $lookup: {
          from: 'tables',
          let: {
            r_id: '$_id'
          },
          as: 'tables',
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    '$r_id',
                    { $toString: '$$r_id' }
                  ]
                }
              }
            },
            {
              $project: {
                _id: '$_id',
                table_number: '$table_number'
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
          as: 'dine-in',
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
              $count: 'count'
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
          as: 'pre-order',
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
              $count: 'count'
            }
          ]
        }
      },
      {
        $addFields: {
          methods: {
            'dine-in': {
              count: { $arrayElemAt: ['$dine-in.count', 0] }
            },
            'pre-order': {
              count: { $arrayElemAt: ['$pre-order.count', 0] }
            }
          }
        }
      },
      {
        $project: {
          'pre-order': 0,
          'dine-in': 0
        }
      }
    )
  }

  const payload: RestaurantDetailResponse[] = []
  const cursor: AggregationCursor<RestaurantDetailResponse> = collections.restaurants.aggregate(pipeline)
  for await (const doc of cursor) {
    payload.push(doc)
  }

  return payload[0]
}
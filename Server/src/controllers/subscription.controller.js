import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { Subscription } from '../models/subscription.model.js'

// Functionalities to be added:
// 1. toggleSubscription
// 2. getAllSubscribers (channelId)
// 3. getAllSubscriptions (userId)

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const subscription = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    });

    if (subscription){
        await Subscription.findByIdAndDelete(subscription?._id);

        return res
            .status(200)
            .json(new ApiResponse(200, { isSubscribed: false }, "Unsubscribed successfully"));
    }

    await Subscription.create({
        channel: channelId,
        subscriber: req.user?._id
    });

    return res
        .status(201)
        .json(201, { isSubscribed: true }, "Subscribed successfully");    
});

const getAllChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // aggregate should return:
    // subscriber: {
    //     username,
    //     id,
    //     profileImageUrl,
    //     subscribers,
    //     isSubscribed,
    // }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber"
                        }
                    },

                    {
                        $addFields: {
                            subscribers: {
                                $size: "$subscribedToSubscriber"
                            },

                            isSubscribedToSubscriber: {
                                $cond: {
                                    $if: {
                                        $in: [
                                            channelId,
                                            "$subscribedToSubscriber.subscriber",
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
            $unwind: "$subscriber"
        },

        {
            $project: {
                _id: 0,
                subscriber: {
                    username: 1,
                    profileImageUrl: 1,
                    subscribers: 1,
                    isSubscribedToSubscriber: 1
                }
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Fetched channel subscribers successfully"));
});

const getAllSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subcribedChannel",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToChannel"
                        }
                    },

                    {
                        $lookup: {
                            from: "videos",
                            localField: "_id",
                            foreignField: "owner",
                            as: "channelVideos",
                        }
                    },

                    {
                        $addFields: {
                            susbcribers: {
                                $size: "$subscribedToChannel",
                            },

                            latestVideo: {
                                $last: "$channelVideos"
                            },
                        },  
                    }
                ]
            },

        },

        {
            $unwind: "$subscribedChannel"
        },

        {
            $project: {
                _id: 0,
                subscribedChannel: {
                    _id: 1,
                    username: 1,
                    profileImageUrl: 1,
                    latestVideo: {
                        _id: 1,
                        "videoFile.url": 1,
                        "thumbnail.url": 1,
                        owner: 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        createdAt: 1
                    },
                    subscribers: 1
                }
            },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannels, "Fetched all user subscribed channels successfully"));
});

export {
    toggleSubscription,
    getAllChannelSubscribers,
    getAllSubscribedChannels,
}
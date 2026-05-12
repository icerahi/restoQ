import { Request, Response } from 'express';
import { restaurantService } from './restaurant.service';
import status from 'http-status';
import ApiError from '../../errors/ApiError';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

const createRestaurant = catchAsync(async (req: Request, res: Response) => {
  const systemUserId = req.user?.userId; 
  
  if (!systemUserId) {
    throw new ApiError(status.UNAUTHORIZED, 'Unauthorized');
  }

  const result = await restaurantService.createRestaurant(req.body, systemUserId);
  
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: 'Restaurant created successfully',
    data: result
  });
});

const listRestaurants = catchAsync(async (req: Request, res: Response) => {
  const result = await restaurantService.listRestaurants();
  
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Restaurants retrieved successfully',
    data: result
  });
});

const getRestaurant = catchAsync(async (req: Request, res: Response) => {
  const result = await restaurantService.getRestaurantById(req.params['id'] as string);
  
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Restaurant details retrieved successfully',
    data: result
  });
});

const updateRestaurant = catchAsync(async (req: Request, res: Response) => {
  const result = await restaurantService.updateRestaurantStatus(req.params['id'] as string, req.body);
  
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Restaurant updated successfully',
    data: result
  });
});

export const restaurantController = {
  createRestaurant,
  listRestaurants,
  getRestaurant,
  updateRestaurant
};

import { StatusCodes } from 'http-status-codes';

import { ResourceService } from '../Services/index.js';
import { sendSuccess } from '../Utils/index.js';

/**
 * Controllers follow a FUNCTIONAL style: each handler is a small, stateless
 * function. Their only job is HTTP concerns — read the (already validated)
 * request, delegate to the service, and shape the response. No business logic
 * and no try/catch (asyncHandler forwards rejections to the error middleware).
 *
 * One shared service instance is fine here since the service is stateless.
 */
const resourceService = new ResourceService();

export const createResource = async (req, res) => {
  const resource = await resourceService.create(req.body);
  sendSuccess(res, {
    statusCode: StatusCodes.CREATED,
    data: resource,
    message: 'Resource created',
  });
};

export const getResource = async (req, res) => {
  const resource = await resourceService.getById(req.params.id);
  sendSuccess(res, { data: resource });
};

export const listResources = async (req, res) => {
  const { page, limit, status } = req.query;
  const filter = status ? { status } : {};
  const { items, meta } = await resourceService.list(filter, { page, limit });
  sendSuccess(res, { data: items, meta, message: 'Resources fetched' });
};

export const updateResource = async (req, res) => {
  const resource = await resourceService.update(req.params.id, req.body);
  sendSuccess(res, { data: resource, message: 'Resource updated' });
};

export const deleteResource = async (req, res) => {
  const result = await resourceService.remove(req.params.id);
  sendSuccess(res, { data: result, message: 'Resource deleted' });
};

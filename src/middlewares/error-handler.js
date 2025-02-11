import { HTTP_STATUS } from '../constants/http-status.js';
import { MESSAGE } from '../constants/message.js';

export default (err, req, res, next) => {
  console.error(err);
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: MESSAGE.ERROR_HANDLER.ETC,
  });
};

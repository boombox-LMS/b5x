import { BoomboxDataManager } from "../db/manager/BoomboxDataManager";

export {};

declare global {
  namespace Express {
    interface Request {
      db: BoomboxDataManager;
      session: any;
    }
  }
}

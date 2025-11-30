using { resurrection.db } from '../db/schema';

service SalesOrderService {
  entity SalesOrder as projection on db.SalesOrder;
}

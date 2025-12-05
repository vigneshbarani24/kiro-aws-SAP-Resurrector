using { resurrection.db as db } from '../db/schema';

service SDService {
  entity VBAP (SALES DOCUMENT: ITEM DATA) as projection on db.VBAP (SALES DOCUMENT: ITEM DATA);
  entity KONV (CONDITIONS (TRANSACTION DATA)) as projection on db.KONV (CONDITIONS (TRANSACTION DATA));
}

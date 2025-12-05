using { resurrection.db as db } from '../db/schema';

service SDService {
  entity VBAK as projection on db.VBAK;
  entity VBAP as projection on db.VBAP;
  entity KONV as projection on db.KONV;
  entity KNA1 as projection on db.KNA1;
}

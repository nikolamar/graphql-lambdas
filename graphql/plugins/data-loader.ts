import DataLoader from "dataloader";
import { DatabaseDataSource } from "../sources/database";

export class DataLoaderPlugin {
  private _tenant: DataLoader<string, any>;

  constructor (db: DatabaseDataSource) {
    this._tenant = new DataLoader(async (list: any) => {
      const records = await db.tenantsByMany({ list });
  
      if (!records) {
        return records.map(() => ({}));
      }
  
      const keyValue: Record<string, any> = {};
      records.forEach((item) => {
        const key = item._id.toString();
        keyValue[key] = item;
      });
  
      return list.map((id: string) => keyValue[id]);
    });
  }

  tenant (args) {
    return this._tenant.load(args);
  }
}
import DataLoader from "dataloader";
import { DatabaseDataSource } from "/opt/datasources/database";

export class DataLoaderPlugin {
  private _tenant: DataLoader<string, any>;

  constructor(db: DatabaseDataSource) {
    this._tenant = new DataLoader(async (list: any) => {
      const records = await db.tenantsByMany({ list });

      if (!records) {
        return records.map(() => ({}));
      }

      const keyValue: Record<string, any> = {};
      records.forEach((item: any) => {
        const key = item._id.toString();
        keyValue[key] = item;
      });

      return list.map((id: string) => keyValue[id]);
    });
  }

  tenant(args: any) {
    return this._tenant.load(args);
  }
}

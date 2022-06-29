export interface DatabasePluginInterface {
  create: (args: any) => any
  read: (args: any) => any
  readByMany: (args: any) => any
  readMany: (args: any) => any
  update: (args: any) => any
  delete: (args: any) => any
  deleteMany: (args: any) => any
  // waitChange: (args: any) => any
}

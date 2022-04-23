declare module "comlink-loader!*" {
  class WebpackWorker extends Worker {
    constructor();

    processData(data: string): Promise<string>;
  }

  export = WebpackWorker;
}

import "leaflet";
import "leaflet-routing-machine";

declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
    const Line: any;
  }
}

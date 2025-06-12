using { sapbackend as external } from './external/sapbackend.csn';

define service SAPBackendExcit {
    @cds.persistence : {
        table,
        skip:false
    }
    @cds.autoexpose
    entity Incidents as projection on external.GtEcpServicioSet;
 
}

@protocol: 'rest'
service RestService {

    entity Incidents as projection on SAPBackendExcit.Incidents;

}
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs/Rx'; // IMPORTANTE: IMPORT ATUALIZADO
import { StorangeService } from '../services/storage.service';
import { AlertController } from 'ionic-angular';
import { FieldMessage } from '../models/fieldmessage';

/**
 * @author Dowglas Maia
 * Class para intercepitar e Padronizar os Erros da da Aplicação 
 */

 @Injectable()
 export class ErrorInterceptor implements HttpInterceptor {   

    constructor(public storange: StorangeService, public arletCtrl: AlertController) {   }
    
        intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
            //console.log("Passou no Interceptor");
            return next.handle(req)
            .catch((error, caught) => {

                let errorObj = error;
                if (errorObj.error) {
                    errorObj = errorObj.error;
                }
                if (!errorObj.status) {
                    errorObj = JSON.parse(errorObj);
                }
    
                console.log("Erro detectado pelo interceptor:");
                console.log(errorObj);

                //Trantando erros especificos
                switch(errorObj.status) {
                     case 403:
                     this.handle403();
                     break;  

                     case 401:
                     this.handle401();
                     break;

                     case 422:
                     this.handle422(errorObj);
                     break;

                     default:
                     this.handleDefaultError(errorObj);
                }
    
                return Observable.throw(errorObj);
            }) as any;
        }

        //Trantando error 422 - mostrando os eeros de validação da API RESTFul
        handle422(errorObj): any {
            let alert = this.arletCtrl.create({
                title: 'Erro 422: Validação',
                message: this.listErrors(errorObj.errors),
                enableBackdropDismiss: false,
                buttons: [
                    {
                        text: 'Ok'
                    }
                ]
            });
            alert.present();
        }

    
     //lista de Erros
     private listErrors(messages : FieldMessage[]) : string {
        let s : string = '';
        for (var i=0; i<messages.length; i++) {
            s = s + '<p><strong>' + messages[i].fieldName + "</strong>: " + messages[i].message + '</p>';
        }
        return s;
    }

         //Trantando Outos Erros
     handleDefaultError(errorObj): any {   
        let alert = this.arletCtrl.create({
        title: 'Erro ' + errorObj.status + ': '+ errorObj.error,
        message: errorObj.message,
        enableBackdropDismiss: false, 
        buttons: [
                {
                 text: 'Ok'
                }
            ] 
        });
        alert.present();
     }

         //Trantando error 401
     handle401(): any {
         let alert = this.arletCtrl.create({
            title: 'Falha de Autenticação!',
            message: 'Email ou Senha Incorretos',
            enableBackdropDismiss: false, 
            buttons: [
                {text: 'Ok'}
            ] 
         });
         alert.present();
     }

        //Trantando error 403
    handle403() {
         this.storange.setLocaUser(null); // limpar o localStorange
    }
 }

export const ErrorInterceptorProvider = {
     provide: HTTP_INTERCEPTORS,
     useClass: ErrorInterceptor,
     multi: true,
 };
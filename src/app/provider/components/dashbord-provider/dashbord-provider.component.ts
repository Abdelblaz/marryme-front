import {AfterViewInit, Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {AuthenticationService} from "../../../user/services/authentication.service";
import {ProviderService} from "../../services/provider.service";
import {BehaviorSubject, first, Observable, tap} from "rxjs";
import {FermeturProviderDasBoardDTO} from "../../models/fermetur-provider-das-board-dto.model";
import {MatTabChangeEvent} from "@angular/material/tabs";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {FormulesProviderDashBoardDTO} from "../../models/formules-provider-dash-board-dto.model";
import {ReservationProviderDashBoardDTO} from "../../models/reservation-provider-dash-board-dto.model";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SalleProviderDasBoardDTO} from "../../models/salle-provider-das-board-dto.modell";
import {ViewSalleServiceComponent} from "../view-salle-service/view-salle-service.component";
import {MakeUPHairProviderDashBoardDTO} from "../../models/make-uphair-provider-dash-board-dto.model";
import {MusiqueProviderDashBoardDTO} from "../../models/musique-provider-dash-board-dto.model";
import {TraiteurProviderDashBoardDTO} from "../../models/traiteur-provider-dash-board-dto.model";
import {ServiceTraiteurProviderDashBoardDTO} from "../../models/service-traiteur-provider-dash-board-dto.model";
import {MediaProviderDashBoardDTO} from "../../models/media-provider-dash-board-dto.model";
import {ViewMediaServiceComponent} from "../view-media-service/view-media-service.component";
import {ViewMusiqueServiceComponent} from "../view-musique-service/view-musique-service.component";
import {ViewMakeUpHairServiceComponent} from "../view-make-up-hair-service/view-make-up-hair-service.component";
import {ViewTraiteurServiceComponent} from "../view-traiteur-service/view-traiteur-service.component";
import {ViewServiceTraiteurServiceComponent} from "../view-service-traiteur-service/view-service-traiteur-service.component";


@Component({
  selector: 'app-dashbord-provider',
  templateUrl: './dashbord-provider.component.html',
  styleUrls: ['./dashbord-provider.component.css']
})
export class DashbordProviderComponent implements OnInit, AfterViewInit {


  allFermeture$!: Observable<FermeturProviderDasBoardDTO[]>;
  allFormules$!: Observable<FormulesProviderDashBoardDTO[]>;
  allFormules: FormulesProviderDashBoardDTO[] = []
  allReservation$!: Observable<ReservationProviderDashBoardDTO[]>;
  allReservation!: ReservationProviderDashBoardDTO[];

  disableSelect = new FormControl(false);
  disabledName = false;
  selected = new FormControl(0);
  form!: FormGroup;
  formtemp!: FormGroup;
  typeOfService!:string;

  @ViewChild('container', { static: true, read: ViewContainerRef }) entry: ViewContainerRef | undefined;



  constructor(private _snackBar: MatSnackBar, private fb: FormBuilder, private auth: AuthenticationService,
              private providerService: ProviderService,private resolver: ComponentFactoryResolver) {
    this.form = this.fb.group({
      formules: this.fb.array([])
    });


  }

  ngOnInit(): void {

    this.typeOfService=this.auth.getServiceType()
    this.allFermeture$ = this.providerService.getAllFermeture()
    this.allReservation$ = this.providerService.getAllReservation()
    this.allFormules$ = this.providerService.getAllFormule()

    // this.traiteurDTO$=this.providerService.getOwnTraiteur();

    this.allFormules$.subscribe(
      (data) => {
        this.setFormArray(data);

      }
  )

    this.allReservation$.subscribe(
      {
        next: (data) =>
        {console.log('RES: ' + JSON.stringify(data));
          this.allReservation=data
        }
      }
    )

    this.injectoProvider()

  }




  ngAfterViewInit(): void {

  }


  setFormArray(data: any[]): void {
    const fgs = data.map((item, index) =>
      this.fb.group({
        formule_id: [{value: item.formule_id, disabled: false}],
        description: [{value: item.description, disabled: false}, Validators.required],
        nom: [{value: item.nom, disabled: false}, Validators.required],
        prix: [{value: item.prix, disabled: false}, Validators.required],
        is_unique_prix: [{value: item.is_unique_prix, disabled: false}, Validators.required],
        sup_dimanche: [{value: item.sup_dimanche, disabled: false}],
        sup_ferrier: [{value: item.sup_ferrier, disabled: false}],
        sup_samedi: [{value: item.sup_samedi, disabled: false}],
        sup_veille_ferier: [{value: item.sup_veille_ferier, disabled: false}],
        supvendredi: [{value: item.supvendredi, disabled: false}],
      })
    );
    const fa = this.fb.array(fgs);
    this.form.setControl("formules", fa);
    console.log("init formGroup: ", this.form);
  }

  onSubmit(formule: FormulesProviderDashBoardDTO): void {
    console.log("current Tabs selected Index: ", this.selected.value);
    console.log("submit form: ", JSON.stringify(formule));
    this.providerService.updateFormule(formule).pipe(first()).subscribe(
      data=>{
        console.log("formule as delete")
      })
  }

  onSelect(tabChangeEvent: MatTabChangeEvent) {
    if (tabChangeEvent.index === 0) {
      console.log('Formule')
      this.allFormules$.subscribe(
        {
          next: (x) => {
            console.log('FORM: ' + JSON.stringify(x));
          }
        }
      )

    } else if (tabChangeEvent.index === 1) {
      console.log('Reservation')

      this.allReservation$.subscribe(
        {
          next: (data) =>
          {console.log('RES: ' + JSON.stringify(data));
          this.allReservation=data
          }
        }
      )

    } else if (tabChangeEvent.index === 2) {
      console.log('Agenda')
      this.allFermeture$
        .subscribe(
          {
            next: (x) => console.log('FERM: ' + JSON.stringify(x))

          }
        )
    }
  }

  get formules() {
    return this.form.get("formules") as FormArray;
  }

  get crtl() {
    return this.formules.controls;
  }

  addTab(selectAfterAdding: boolean) {

    if (this.formules.length < 3) {
      console.log(this.formules)
      const fa = this.formules.push(this.createFormules());
      this.selected.setValue(this.formules.length);
    } else {
      this._snackBar.open("Pas plus de 3 Formules");

    }
  }

  createFormules(): FormGroup {

    return this.fb.group({
      // formule_id: [{value:  null, disabled: false}, Validators.required],
      description: [{value: "", disabled: false}, Validators.required],
      nom: [{value: "", disabled: false}, Validators.required],
      prix: [{value: 0, disabled: false}, Validators.required],
      is_unique_prix: [{value: false, disabled: false}],
      sup_dimanche: [{value: 0, disabled: false}],
      sup_ferrier: [{value: 0, disabled: false}],
      sup_samedi: [{value: 0, disabled: false}],
      sup_veille_ferier: [{value: 0, disabled: false}],
      supvendredi: [{value: 0, disabled: false}],
    })
  }




  removeTab(index: number,formule: FormulesProviderDashBoardDTO) {
    this.formules.removeAt(index);
    if (formule.formule_id){
      this.providerService.deleteFormule(formule).pipe(first()).subscribe(
        data=>{
          console.log("formule as delete")
        })
    }
  }

  injectoProvider()
  {
    // @ts-ignore
    this.entry.clear();
    if(this.typeOfService=="SalleEntity"){
      const factory = this.resolver.resolveComponentFactory(ViewSalleServiceComponent)
      // @ts-ignore
      const componentRef = this.entry.createComponent(factory);
      }else if(this.typeOfService=="MediaEntity"){
      const factory = this.resolver.resolveComponentFactory(ViewMediaServiceComponent)
      // @ts-ignore
      const componentRef = this.entry.createComponent(factory);
    }else if(this.typeOfService=="MusiqueEntity"){
      const factory = this.resolver.resolveComponentFactory(ViewMusiqueServiceComponent)
      // @ts-ignore
      const componentRef = this.entry.createComponent(factory);
    }else if(this.typeOfService=="MakeUpAndHairEntity"){
      const factory = this.resolver.resolveComponentFactory(ViewMakeUpHairServiceComponent)
      // @ts-ignore
      const componentRef = this.entry.createComponent(factory);
    }else if(this.typeOfService=="TraiteurEntity"){
      const factory = this.resolver.resolveComponentFactory(ViewTraiteurServiceComponent)
      // @ts-ignore
      const componentRef = this.entry.createComponent(factory);
    }else if(this.typeOfService=="ServiceTraiteurEntity"){
      const factory = this.resolver.resolveComponentFactory(ViewServiceTraiteurServiceComponent)
      // @ts-ignore
      const componentRef = this.entry.createComponent(factory);
    }
  }


}

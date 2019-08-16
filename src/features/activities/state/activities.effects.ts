import { ActivitiesService } from '../activities.service';
import {Actions, Effect, ofType, createEffect} from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { ActivityActionTypes, LoadActivity, LoadSuccessful, LoadFailed, DeleteActivity, DeleteSuccessful, DeleteFailed, AddActivity, AddSuccessful, AddFailed } from './activities.actions';
import { map, mergeMap, catchError, switchMap, tap } from 'rxjs/operators';
import { Activity } from 'src/models/activity.model';
import { Injectable } from '@angular/core';
import { CustomResponse } from 'src/models/custom-response.model';
import { Router } from '@angular/router';

@Injectable()
export class ActivityEffects {
  constructor(
    private activitiesService: ActivitiesService,
    private actions$: Actions,
    private router: Router) {}

  @Effect()
  loadActivities$: Observable<Action> = this.actions$.pipe(
    ofType(ActivityActionTypes.LoadActivity),
    map((action: LoadActivity) => action.payload),
    mergeMap((email: string) =>
      this.activitiesService.getActivities(email).pipe(
        map( (activities: Activity[]) => {
          return new LoadSuccessful(activities);
        }),
        catchError((err: CustomResponse) => of(new LoadFailed(err.errorMessages)))
      )
    )
  );

  @Effect()
  addActivity$: Observable<Action> = this.actions$.pipe(
    ofType(ActivityActionTypes.AddActivity),
    map((action: AddActivity) => action.payload),
    mergeMap((activity: Activity) =>
      this.activitiesService.postActivity(activity).pipe(
        map(res => {
          this.router.navigate(['/actividades']);
          return new AddSuccessful(activity);
        }),
        catchError((err: CustomResponse) => of(new AddFailed(err.errorMessages)))
      )
    )
  );

  @Effect()
  deleteActivity$: Observable<Action> = this.actions$.pipe(
    ofType(ActivityActionTypes.DeleteActivity),
    map((action: DeleteActivity) => action.payload),
    mergeMap((id: number) =>
      this.activitiesService.deleteActivity(id).pipe(
        map(res => {
          return new DeleteSuccessful(id);
        }),
        catchError((err: CustomResponse) => of(new LoadFailed(err.errorMessages)))
      )
    )
  );
}

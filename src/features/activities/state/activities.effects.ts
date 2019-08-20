import { ActivitiesService } from '../activities.service';
import {Actions, Effect, ofType, createEffect} from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { ActivityActionTypes, LoadActivity, LoadSuccessful, LoadFailed, DeleteActivity, DeleteSuccessful, DeleteFailed, AddActivity, AddSuccessful, AddFailed, AddActivityFiles, UpdateFilesProgress } from './activities.actions';
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
    switchMap((content: {activity: Activity, files: Set<File>}) =>
      this.activitiesService.postActivity(content.activity).pipe(
        map(res => {
          console.log('response');
          console.log(res);
          if (content.files.size !== 0) {
            console.log('yes files');
            console.log(content.files);
            const filePackage = {id: res, files: content.files};
            return new AddActivityFiles(filePackage);
          } else {
            this.router.navigate(['/actividades']);
            return new AddSuccessful(content.activity);
          }
        }),
        catchError((err: CustomResponse) => of(new AddFailed(err.errorMessages)))
      )
    )
  );

  @Effect()
  uploadFiles$ = this.actions$.pipe(
    ofType(ActivityActionTypes.AddActivityFiles),
    map((action: AddActivityFiles) => action.payload),
    switchMap((content: {id: number, files: Set<File>}) =>
    this.activitiesService.uploadActivityFiles(content.id, content.files).pipe(
        map(res => {
          this.router.navigate(['/actividades']);
          return new UpdateFilesProgress([]);
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

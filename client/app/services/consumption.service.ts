import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Consumption } from '../shared/models/consumption.model';

@Injectable()
export class ConsumptionService {

  constructor(private http: HttpClient) { }

  getConsumptions(): Observable<Consumption[]> {
    return this.http.get<Consumption[]>('/api/consumptions');
  }

  countConsumptions(): Observable<number> {
    return this.http.get<number>('/api/consumptions/count');
  }

  addConsumption(consumption: Consumption): Observable<Consumption> {
    console.log(consumption)
    return this.http.post<Consumption>('/api/consumption', consumption);
  }

  getConsumption(consumption: Consumption): Observable<Consumption> {
    return this.http.get<Consumption>(`/api/consumption/${consumption._id}`);
  }

  editConsumption(consumption: Consumption): Observable<string> {
    return this.http.put(`/api/consumption/${consumption._id}`, consumption, { responseType: 'text' });
  }

  deleteConsumption(consumption: Consumption): Observable<string> {
    return this.http.delete(`/api/consumption/${consumption._id}`, { responseType: 'text' });
  }

}

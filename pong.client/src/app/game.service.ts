import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'https://localhost:5001/api/game';

  constructor(private http: HttpClient) { }

  getScore(): Observable<any> {
    return this.http.get(`${this.apiUrl}/score`);
  }

  updateScore(score: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/updateScore`, score);
  }
}

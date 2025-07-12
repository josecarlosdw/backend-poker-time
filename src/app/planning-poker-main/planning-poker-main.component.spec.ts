import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanningPokerMainComponent } from './planning-poker-main.component';

describe('PlanningPokerMainComponent', () => {
  let component: PlanningPokerMainComponent;
  let fixture: ComponentFixture<PlanningPokerMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanningPokerMainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanningPokerMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

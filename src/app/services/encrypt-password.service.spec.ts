import { TestBed } from '@angular/core/testing';

import { EncryptPasswordService } from './encrypt-password.service';

describe('EncryptPasswordService', () => {
  let service: EncryptPasswordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncryptPasswordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

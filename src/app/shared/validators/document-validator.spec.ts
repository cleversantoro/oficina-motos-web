import { TestBed } from '@angular/core/testing';

import { DocumentValidator } from './document-validator';

describe('DocumentValidator', () => {
  let service: DocumentValidator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentValidator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

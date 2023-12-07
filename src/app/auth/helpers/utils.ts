import { AbstractControl } from "@angular/forms";

export function phoneNumberValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const phoneNumber = control.value;
  
    // Check if phoneNumber is not empty
    if (phoneNumber) {
      // Check if phoneNumber is exactly 10 digits, starts with 0, and the second digit is 5, 6, or 7
      const regex = /^0[5-7]\d{8}$/;
      return regex.test(phoneNumber) ? null : { invalidPhoneNumber: true };
    }
  
    return null;
}
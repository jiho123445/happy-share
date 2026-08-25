# Student Email Policy Change

- Student signup no longer requires Firebase email verification.
- Firebase Authentication still validates the email address format when creating the account.
- Student accounts are always created with `status: '승인대기'`.
- Access to student materials remains protected by the existing approval rules.
- `학원서식` remains admin-only; `예제서식` and `채점프로그램` remain available to approved students.
- Verification email sending was removed from signup, so Firebase verification-email image/template problems no longer block signup.

## Security trade-off

The site no longer proves that the applicant controls the submitted email address. A user can register with a syntactically valid email they do not own. This does not grant student-material access until an administrator approves the student account, but it can create fake/pending accounts and means password-reset email remains the main email-ownership recovery mechanism.

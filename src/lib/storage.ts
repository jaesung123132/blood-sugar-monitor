/**
 * 브라우저 저장소는 사생활 보호 모드나 저장 공간 부족 등으로 실패할 수 있어서
 * 항상 안전하게 감싸서 씁니다. 실패해도 앱은 계속 동작합니다.
 * (가족 기록처럼 잃어버리면 안 되는 데이터는 M2부터 클라우드에 저장합니다.)
 */
export function readFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

export function writeFlag(key: string, value: boolean): void {
  try {
    window.localStorage.setItem(key, value ? 'true' : 'false');
  } catch {
    // 저장에 실패하면 다음 실행 때 동의 화면이 다시 보일 수 있습니다.
  }
}

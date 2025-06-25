// 한국 시간대 (KST: UTC+9)
const KST_OFFSET = 9 * 60; // 분 단위

// UTC 시간을 한국 시간으로 변환
export const utcToKst = (utcDate: Date | string): Date => {
  const date = new Date(utcDate);
  return new Date(date.getTime() + KST_OFFSET * 60 * 1000);
};

// 한국 시간을 UTC로 변환
export const kstToUtc = (kstDate: Date | string): Date => {
  const date = new Date(kstDate);
  return new Date(date.getTime() - KST_OFFSET * 60 * 1000);
};

// 한국 시간으로 날짜 포맷팅
export const formatKstDate = (
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
};

// datetime-local 입력용 한국 시간 문자열 생성
export const toKstLocalString = (date: Date | string): string => {
  const kstDate = utcToKst(date);
  return kstDate.toISOString().slice(0, 16);
};

// 한국 시간 문자열을 UTC로 변환
export const fromKstLocalString = (kstLocalString: string): string => {
  // kstLocalString은 "YYYY-MM-DDTHH:mm" 형식 (한국 시간)
  // 예: "2025-06-21T18:00" (오후 6시)

  // 1. 년, 월, 일, 시, 분을 분리
  const [datePart, timePart] = kstLocalString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  // 2. 한국 시간으로 Date 객체 생성 (월은 0부터 시작하므로 -1)
  const kstDate = new Date(year, month - 1, day, hour, minute, 0, 0);

  // 3. 한국 시간대 오프셋 적용 (현재 시스템 시간대와 KST의 차이 계산)
  const systemOffset = kstDate.getTimezoneOffset(); // 시스템 시간대 오프셋 (분)
  const kstOffset = KST_OFFSET; // KST 오프셋 (분)
  const offsetDiff = systemOffset + kstOffset; // 시스템 시간대에서 KST로 변환하기 위한 차이

  // 4. UTC로 변환
  const utcDate = new Date(kstDate.getTime() - offsetDiff * 60 * 1000);

  return utcDate.toISOString();
};

// 투표 남은 시간 계산 (한국 시간 기준)
export const getTimeLeft = (expiresAt: Date | string | null): string | null => {
  if (!expiresAt) return null;

  const now = new Date();
  const kstNow = utcToKst(now);
  const kstExpires = utcToKst(expiresAt);

  const msLeft = kstExpires.getTime() - kstNow.getTime();
  if (msLeft <= 0) return null;

  const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}일 ${hours}시간 ${minutes}분 남음`;
  if (hours > 0) return `${hours}시간 ${minutes}분 남음`;
  return `${minutes}분 남음`;
};

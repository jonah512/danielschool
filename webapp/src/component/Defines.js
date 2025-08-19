const Defines = {
  ClientId: "ctu",
  gradeOptions: [
    { value: -2, label: 'Junior Kindergarten' },
    { value: -1, label: 'Senior Kindergarten' },
    ...Array.from({ length: 12 }, (_, i) => ({ value: (i + 1), label: `Grade ${i + 1}` })),
  ],
  koreanLevelOptions: [
    { level: 0, label: 'Not Defined (Unknown)', example: ''},
    { level: 1, label: '기본 자음 14개와 기본 모음 10개를 공부합니다. Will study the following words.', example: '사자, 가수, 오이, 우유, 아이'},
    { level: 2, label: '쌍자음 5개와 이중모음 11개를 공부합니다.', example: '찌개, 머리띠, 쓰레기, 돼지, 과자, 시계'},
    { level: 3, label: '받침 ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅇ 이 들어간 단어를 공부합니다.', example: '국, 문, 돋보기, 하늘, 곰, 입, 강'},
    { level: 4, label: '받침 ㄲ, ㅅ, ㅆ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㅎ 이 들어간 단어를 공부합니다.', example: '낚시, 옷, 낮, 꽃, 부엌, 밭, 숲'},
    { level: 5, label: '기본 동사를 포함한 다양한 어휘들을  공부합니다.', example: '가다, 오다, 먹다, 따라가다, 잃어버리다, 웃고 있다'},
    { level: 6, label: '기본 문장을 공부합니다.', example: '이게 뭐예요? 안녕하세요? 저는 ~예요'},
    { level: 7, label: '목적어와 부사어가 들어 간 문장을 공부합니다.', example: '나는 밥을 먹어요. 나는 학교에 가요. 장난감 기차가 있어요. 자리에 앉아요.'},
    { level: 8, label: '생일, 나이, 신분, 장소 명칭 등 구체적인 정보가 들어간 문장을 공부합니다. ', example: '제 생일은 ~예요. 저는 ~살이에요, 우리집 주소는 ~예요.'},
    { level: 9, label: '부정문과 능력이나 가능을 나타내는 문장을 공부합니다.', example: '저는 학생이 아니에요. 저는 김치를 못 먹어요. 저는 한국어를 할 수 있어요.'},
    { level: 10, label: '시제가 들어간 문장을 공부합니다.', example: '어제 공원에 갔어요. 내일 병원에 갈 거예요.'},
    { level: 11, label: '다음과 같이 연결어가 들어 간 문장을 공부합니다.', example: '금요일에 학교에서 컴퓨터 수업을 들어요. 그리고 집에 돌아와서 피아노를 배워요. 저는 한국 음식을 좋아해요. 하지만 김치는 잘 못 먹어요.'},
    { level: 12, label: '문단을 공부합니다.', example: ''},
  ],
  religion: [
    { value: 'protestant', label: 'Protestant' },
    { value: 'catholic', label: 'Catholic' },
    { value: 'other', label: 'Other' },
    { value: 'no', label: 'No' },
  ],
  enrollmentStatus: ['enrolled', 'waiting', 'not-enrolled'],
  MAX_WAITING_POSITION: 10,
  UTC_GAP: -8
};

export default Defines;

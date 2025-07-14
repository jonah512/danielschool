#Daniel Korean Language School Admin Web


TODO)
1. 클라우드에 올리기 테스트
>> done : 2. 동의서 확인하는 페이지 올리기
3. 과목 설명을 팝업에 보여주기
>> done 4. 주소 지우기
5. 수강신청 관리자 화면 폰트와 셀크기 줄일것

6. 과목 설명이 팝업으로(수강신청 화면에서 과목에 대한 상세 설명 볼 수 있도록)
7. 검색이 페이지 옮길때 리셋되도록
8. 교실관리자 화면에서 검색은 학생에 대한 검색이며, 학생 검색시에 수강신청 인원수는 그대로 보이도록
>> done : 9. 언어가 cache에 없을 때에 한글이 기본
10. 과목 보여지는 ordering 순서를 관리자가 정할 수 있도록
11. 한국어 레벨선택에서 상세 팝업을 띄워서 선택할 수 있도록
    (이름, 설명, 예)로 만들것
>> done : 12. 부모가 학생 이름으로 찾을 수 있도록
13. '학생 > 새학생추가'에서 field 공백 없을 때에 '추가'버튼 활성화

docker-compose -p daniel up --build -d
docker save -o daniel-service.tar daniel-daniel-service

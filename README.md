#Daniel Korean Language School Admin Web


TODO)
1. 클라우드에 올리기 테스트
>> done : 2. 동의서 확인하는 페이지 올리기
>> done : 3. 과목 설명을 팝업에 보여주기
>> done : 4. 주소 지우기
>> 불필요 : 5. 수강신청 관리자 화면 폰트와 셀크기 줄일것
>> done : 6. 과목 설명이 팝업으로(수강신청 화면에서 과목에 대한 상세 설명 볼 수 있도록)
>> done : 7. 검색이 페이지 옮길때 리셋되도록
>> done : 8. 교실관리자 화면에서 검색은 학생에 대한 검색이며, 학생 검색시에 수강신청 인원수는 그대로 보이도록
>> done : 9. 언어가 cache에 없을 때에 한글이 기본
>> done : 10. 과목 보여지는 ordering 순서를 관리자가 정할 수 있도록
>> done : 11. 한국어 레벨선택에서 상세 팝업을 띄워서 선택할 수 있도록
    (이름, 설명, 예)로 만들것
>> done : 12. 부모가 학생 이름으로 찾을 수 있도록
>> done : 13. '학생 > 새학생추가'에서 field 공백 없을 때에 '추가'버튼 활성화
>> done : 14. 과목 수정시에 수업료 반영
>> done : 15. 과목별로 필요 한글 등급 지정하도록
>> done : 16. 한글등급에 대한 설명 추가
>> done : 17. 한글 수준은 신규등록자만 선택.기존은 선생님이 지정
>> done : 18. 부모는 한국어 수준을 보여주지 말아야 함. 
>> done : 19. 한글 수준에 대해서 최저~ 최고 를 지정
>> done : 20. 과목 하단에 한글 수준 표시(한글반만)
21. 출석부
>> done : 22. 수업 수정후에 검색어 적용 안되고 있음음
>> done : 23. 과목 선택 화면에서 alert 메세지들을 resource로 옮길것
>> done : 24. Acodian의 이동버튼들 메세지들을 resource로 옮길것 
>> done : 25. 학생 추가하는 기능 
>> done : 26. GMAIL 권장하기기
>> done : 27. 버튼들에 아이콘 넣기.
>> done : 28. 과목 선택창에 경고문구는 red color.
>> done : 29. 한글등급선택하는 팝업창 만들기(신규 등록시에에)
>> done : 30. 학부모 이메일 xkdlxmf--> 구분할 것
>> done : 31. 추가 요청사항 입력하고 확인하는 기능능
>> done : 32. email 찾기 버튼의 색깔을 바꿀것
33. 수강확정내용 이메일 발송하기
>> done : 34. 과목선택에서 다음단계 넘어가는 체커 함수 점검하기
>> done : 35. 테마를 블루톤으로 변경하기기
>> done : 36. 과목별 수강신청 현황 페이지 element크기 줄이기
>> doen : 37. 수강 신청하기에서 학생 지우기 불필요
38. 과목 전체 안내 이미지 다시 올리기 >> thumb nail로 보여주기
>> done : 39. 학생 선택 페이지에서 모바일의 경우 수정일 숨길것것
40. 과목 내용 보기 팝업 유지 시간 늘이기
>> done : 41. 교실관리자에서 학생 찾기를 한 경우에는 그 학생의 이름을 빨간색으로 보여주기
>> done : 42. 수강신청 페이지 주기적으로 수강신청현황 다시 불러오기
>> done : 43. 학생선택 화면에서 수강신청 현황 주기적으로 다시 불러오기
>> done : 44. 교사 추가시에 필요 정보 알람 반드시 띄울것 -> email and phone number should not be unique
>> done : 45. Grade확인하는 팝업창 학생 정보 확인란에 띄울것것
>> done : 46. 학년 확인하라는 팝업을 따로 만들것.
>> done : 47. 학생정보 추가/수정할때 부모 항목을 아래에 배치
>> done : 48. Concent Form 스크롤. 
지난학기 
수강신청 먼저
>> done 모바일용으로 width 조절
>> Requirement 학년 
>> 1교시 옆으로
>> done : 종교 기독교
>> done : 1교시 2교시 3교시 
>> done : 신청한 과목에 시메스터 
>> done : 위 사항이 맞습니까
>> done : 등록 enrolled 
>> done : 나가기 exit 

sudo docker stop daniel-service
sudo docker rm daniel-service
sudo docker-compose -p daniel up --build -d
sudo docker save -o daniel-service.tar daniel-daniel-service
sudo docker exec -it daniel-service /bin/bash
sudo docker logs -f daniel-service


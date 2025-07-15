const Korean = {
    common: {
        title: "다니엘 한국어 학교 관리자 웹",
        dialog: {
            ok: "확인",
            cancel: "취소",
            yes: "예",
            no: "아니오",
            confirm: "확인",
            close: "닫기",
            error: "오류",
            warning: "경고",
            noti: "알림",
            save: "저장",
            submit: "제출"
        },
        save: "현재 워크플로우에 저장",
        delete: "삭제",
        uploadfile: "파일 업로드",
        selectall: "전체 선택",
        download: "다운로드",
        rowsperpage: "페이지당 행 수",
        copyright: "Copyright © {0} Milal Daniel Korean School. All rights reserved.",
        uploadimages: "이미지 업로드",
        incompleteimageupload: "{1}개 중 {0}개의 이미지가 성공적으로 업로드되었습니다.",
        search: "검색"
    },
    cmsconnection: {
        connected: "관리 서비스에 연결되었습니다.",
        disconnected: "관리 서비스와의 연결이 끊겼습니다."
    },
    login: {
        id: "아이디",
        password: "비밀번호",
        "sign-in": "로그인",
        logout: "로그아웃",
        loginfailtitle: "로그인 실패",
        loginforbiddencontent: "이 IP 주소에서는 로그인이 금지되어 있습니다.",
        loginfailcontent: "아이디와 비밀번호를 다시 확인해 주세요!"
    },
    menu: {
        users: "사용자",
        students: "학생",
        teachers: "교사",
        classes: "수업",
        enrollment: "수강신청",
        classroommanager: "교실 관리자",
        schedule: "수강신청 일정",
        consents: "동의서"
    },
    users: {
        id: "아이디",
        username: "사용자 이름",
        email: "이메일",
        created_at: "생성일",
        updated_at: "수정일",
        role: "역할",
        is_active: "활성화됨"
    },
    students: {
        id: "아이디",
        title: "새 학생 추가",
        name: "학생 이름",
        birthdate: "생년월일",
        email: "학부모 이메일",
        phone: "전화번호",
        parent_name: "학부모 이름",
        address: "주소",
        deletetitle: "학생 삭제",
        deletecontent: "이 학생을 삭제하시겠습니까?",
        edit_title: "학생 정보 수정",
        korean_level: "한국어 수준",
        church: "출석 교회",
        gender: "성별",
        created_at: "등록일",
        updated_at: "수정일",
        religion: "종교",
        protestant: "개신교",
        catholic: "천주교",
        other: "기타",
        no: "없음",
        grade: "학년",
        bulk_upload: "일괄 업로드",
        missing: "'{0}'이(가) 누락되었습니다."
    },
    teachers: {
        id: "아이디",
        title: "새 교사 추가",
        name: "이름",
        subject: "과목",
        email: "이메일",
        phone: "전화번호",
        deletetitle: "교사 삭제",
        deletecontent: "이 교사를 삭제하시겠습니까?",
        edit_title: "교사 정보 수정"
    },
    classes: {
        id: "아이디",
        title: "새 수업 추가",
        name: "이름",
        description: "설명",
        year: "년도",
        term: "학기",
        min_grade: "최소 학년",
        max_grade: "최대 학년",
        teacher: "담당 교사",
        max_students: "최대 수강 인원",
        period: "수업 시간",
        deletecontent: "이 수업을 삭제하시겠습니까?",
        edit_title: "수업 수정",
        validation_error: "유효성 오류",
        year_error: "년도는 2000년에서 2100년 사이여야 합니다.",
        mendatory: "필수",
        fee: "수업료",
        min_korean_level: "최소 한국어 수준",
        max_korean_level: "최대 한국어 수준"
    },
    enrollment: {
        id: "아이디",
        student_name: "학생 이름",
        grade: "학년",
        period_1: "1교시",
        period_2: "2교시",
        period_3: "3교시",
        status: "상태",
        comment: "비고"
    },
    usermenu: {
        language: "언어"
    },
    classroom: {
        name: "이름(학년)",
        add_student: "학생 추가",
        remove_student_tilte: "학생 제거",
        remove_student_content: "학생 '{0}'을(를) 제거하시겠습니까?"
    },
    schedules: {
        id: "아이디",
        title: "새 일정 추가",
        year: "년도",
        term: "학기",
        opening_time: "시작 시간",
        closing_time: "종료 시간",
        deletetitle: "일정 삭제",
        deletecontent: "이 일정을 삭제하시겠습니까?",
        edit_title: "일정 수정"
    },
    consents: {
        id: "아이디",
        title: "새 동의서 추가",
        name: "이름",
        content: "내용(한국어)",
        content_eng: "내용(영어)",
        deletetitle: "동의서 삭제",
        deletecontent: "이 동의서를 삭제하시겠습니까?",
        edit_title: "동의서 수정",
        consent_title: "동의서 작성",
        agree: "동의합니다.",
        start_enrollment: "수강신청 시작하기"
    },
    topbar: {
        title: "{0}년 {1} 수강신청",
        name: "학생 이름:",
        grade: "학년:",
        spring: "봄 학기",
        fall: "가을 학기"
    },
    student_selection: {
        year: "년도",
        term: "학기",
        class_name: "수업명",
        updated_at: "수정일",
        delete_title: "학생 선택 삭제",
        delete_content: "이 학생을 삭제하시겠습니까?",
        select_class: "수강 선택",
        logout: "로그아웃"
    },
    register: {
        guide_korean: "지난 학기 등록되었던 학생이면, 아래에서 등록시 사용되었던 부모님의 Email 주소를 입력해 주세요.",
        guide_english: "If you have registered in the past, please enter the parent's email address used for registration below.",
        start_registration: "Start Registration. {0}년 {1}학기 수강신청 시작하기",
        guide2: "자녀가 처음 등록하는 경우에는 새로 등록해 주세요.",
        create_new_student: "New Student. 신규 학생으로 {0}년 {1}학기 수강신청 시작하기",
        cannot_find_email: "Cannot find the email address. Please check the email address and try again.",
        find_email: "부모님의 이메일: ",
        find_email_by_name: "학생이름으로 Email 찾기",
        student_name: "학생 이름",
        basic_info: "기본정보확인",
        select_class: "과목선택",
        final_confirm: "최종확인"
    }
};

export default Korean;

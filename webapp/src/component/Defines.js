const Defines = {
  ClientId: "ctu",
  gradeOptions: [
    { value: -2, label: 'Junior Kindergarten' },
    { value: -1, label: 'Senior Kindergarten' },
    ...Array.from({ length: 12 }, (_, i) => ({ value: (i + 1), label: `Grade ${i + 1}` })),
  ],
  koreanLevelOptions: [
    { level: 1, label: 'Level 1' },
    { level: 2, label: 'Level 2' },
    { level: 3, label: 'Level 3' },
    { level: 4, label: 'Level 4' },
    { level: 5, label: 'Level 5' },
    { level: 6, label: 'Level 6' },
    { level: 7, label: 'Level 7' },
    { level: 8, label: 'Level 8' },
    { level: 9, label: 'Level 9' },
    { level: 10, label: 'Level 10' },
    { level: 11, label: 'Level 11' },
    { level: 12, label: 'Level 12' }
  ],
  religion: [
    { value: 'protestant', label: 'Protestant' },
    { value: 'catholic', label: 'Catholic' },
    { value: 'other', label: 'Other' },
    { value: 'no', label: 'No' },
  ],
  enrollmentStatus: ['enrolled', 'waiting', 'not-enrolled'],
  MAX_WAITING_POSITION: 7,
};

export default Defines;

const Defines = {
  ClientId: "ctu",
  gradeOptions : [
    { value: -2, label: 'Junior Kindergarten' },
    { value: -1, label: 'Senior Kindergarten' },
    ...Array.from({ length: 12 }, (_, i) => ({ value: (i + 1), label: `Grade ${i + 1}` })),
  ],
  koreanLevelOptions: [1,2,3,4,5,6,7,8,9,10,11,12,13,14],
  religion : [
    {value:'protestant', label: 'Protestant'},
    {value:'catholic', label: 'Catholic'},
    {value:'other', label: 'Other'},
    {value:'no', label: 'No'}
  ],
  enrollmentStatus: ['enrolled', 'waiting', 'not-enrolled'],
  MAX_WAITING_POSITION: 5,
};


export default Defines;
namespace com.training;

using {
    cuid
} from '@sap/cds/common';

entity Course: cuid {
        Student : Association to many StudentCourse
                      on Student.Course = $self;
};

entity Student: cuid {
        Course : Association to many StudentCourse
                     on Course.Student = $self;
};

entity StudentCourse: cuid {
        Student : Association to Student;
        Course  : Association to Course;

};

// entity Car {
//     key id        : UUID;
//         name      : String;
//         discount1 : Decimal;
//         discount2 : Decimal;
// }


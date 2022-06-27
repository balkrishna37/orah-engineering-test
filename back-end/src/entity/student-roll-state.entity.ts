import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, OneToMany } from "typeorm"
import { CreateStudentRollStateInput, UpdateStudentRollStateInput } from "../interface/student-roll-state.interface"
import { Student } from "./student.entity";
import { Roll } from "./roll.entity";

@Entity()
export class StudentRollState {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  student_id: number

  @Column()
  roll_id: number

  @Column()
  state: string

  @ManyToOne(()=>Student,student=>student.states)
  @JoinColumn({name:"student_id",referencedColumnName:"id"})
  public student: Student;

  @ManyToOne(()=>Roll,roll=>roll.studentRoleState)
  @JoinColumn({name:"roll_id",referencedColumnName:"id"})
  public roll: Roll;

  public prepareToCreate(input: CreateStudentRollStateInput) {
    this.state = input.state
    this.student_id = input.student_id
    this.roll_id = input.roll_id
  }

  public prepareToUpdate(input: UpdateStudentRollStateInput) {
    if (input.state !== undefined) this.state = input.state
    if (input.student_id !== undefined) this.student_id = input.student_id
    if (input.roll_id !== undefined) this.roll_id = input.roll_id
  }
}

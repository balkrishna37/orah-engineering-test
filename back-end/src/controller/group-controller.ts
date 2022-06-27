import { NextFunction, Request, Response } from "express"
import { getRepository } from "typeorm"
import { Group } from "../entity/group.entity";
import { GroupStudent } from "../entity/group-student.entity";
import { StudentRollState } from "../entity/student-roll-state.entity";
import { CreateGroupInput, UpdateGroupInput } from "../interface/group.interface";
import { CreateGroupStudentInput, getGroupStudentsOutput } from "../interface/group-student.interface";
import * as moment from 'moment';

export class GroupController {
  private groupRepository = getRepository(Group);;
  private groupStudentRepository = getRepository(GroupStudent);
  private studentRollStateRepository = getRepository(StudentRollState);

  async allGroups(request: Request, response: Response, next: NextFunction) {
    try {
      const data = await this.groupRepository.find();
      return data;
      
    } catch (error) {
      throw error;
      
    }

    // Task 1: 
    
    // Return the list of all groups
  }

  async createGroup(request: Request, response: Response, next: NextFunction) {
    const {body: params} = request;

    const createGroupInput: CreateGroupInput = {
      name: params.name,
      number_of_weeks: params.number_of_weeks,
      roll_states: params.roll_states,
      incidents: params.incidents,
      ltmt: params.ltmt
    };
    
    const group = new Group();
    group.prepareToCreate(createGroupInput);
    return this.groupRepository.save(group);
    // Task 1: 
    
    // Add a Group
  }

  async updateGroup(request: Request, response: Response, next: NextFunction) {
    try {
      const { body: params } = request
      let groupToUpdate = await this.groupRepository.findOne(request.params.id);

      if(groupToUpdate){
        const updateGroupInput: UpdateGroupInput = {
          name: params.name,
          number_of_weeks: params.number_of_weeks,
          roll_states: params.roll_states,
          incidents: params.incidents,
          ltmt: params.ltmt
        }
        groupToUpdate.prepareToUpdate(updateGroupInput);
        await this.groupRepository.update(
          request.params.id,
          updateGroupInput
        )
        response.send({message:'Group updated Successfully'});
      }
      else{
        response.status(404).send({message:'Group not found'});
      }
      
    } catch (error) {
      throw error;
      
    }
    // Task 1: 
    
    // Update a Group
  }

  async removeGroup(request: Request, response: Response, next: NextFunction) {
    try {
      let rollToRemove = await this.groupRepository.findOne(request.params.id)

      if(rollToRemove){
        await this.groupRepository.remove(rollToRemove)
        response.send({message:'Group deleted Successfully'});
      }
      else{
        response.status(404).send({message:'Group not found'});
      }      
      
    } catch (error) {
      throw error;      
    }
    
    // Task 1: 
    
    // Delete a Group
  }

  async getGroupStudents(request: Request, response: Response, next: NextFunction) {
    try {
      let groupStudent = await this.groupStudentRepository.find({
        where: {
          group_id:request.params.id,
        },
        relations: ['student']
      });

      if(groupStudent){
        let studentIds = [];
        let students = [];
        groupStudent.forEach(group=>{
          const isDuplicate = studentIds.includes(group.student_id);
          if(!isDuplicate){
            let student: getGroupStudentsOutput = {
              first_name: group.student.first_name,
              last_name: group.student.last_name,
              full_name: `${group.student.first_name} ${group.student.last_name}`            
            };
            students.push(student);
            studentIds.push(group.student_id);
          }
        })
       return students;
      }
      else{
        response.status(404).send({message:'Group not found'});
      }      
      
    } catch (error) {
      throw error;      
    }
  }


  async runGroupFilters(request: Request, response: Response, next: NextFunction) {
    /*
    1.  First we take all the groups and students from the database.
    2.  We loop through group.
      a. We filter the students based on roll states and number of past weeks and then group then by student ID.
      b. THen for each grouped ID, we check if the criteria of group matches or not. If matched, we save the data
         to group student table
    3. Then we save the metadata to the group table.
    4. Once completes, responds with the message.
    */
    try {
      const groupStudents = await this.groupStudentRepository.find();
      const groupStudentIds = groupStudents.map(groupStudent=>groupStudent.id);
      await this.groupStudentRepository.delete(groupStudentIds);
      const groups = await this.groupRepository.find();
      const students = await this.studentRollStateRepository.find({
        relations: ['student','roll']
      });
      groups.forEach(async group=>{
        let studentCountForGroup = 0;
        let startDate = moment().subtract(group.number_of_weeks,'weeks').format();
        let filteredStudents = students.filter(student=>student.state==group.roll_states
        && student.roll.completed_at>=new Date(startDate));

        let groupedStudents = filteredStudents.reduce((r,a)=>{
          r[a.student_id] = r[a.student_id] || [];
          r[a.student_id].push(a);
          return r;
        },Object.create(null));

        for (const key in groupedStudents){    
          let condition = (group.ltmt=='>') ?   groupedStudents[key].length>group.incidents : groupedStudents[key].length<group.incidents;
            if(condition){
              studentCountForGroup++;
              const createGroupStudentInput: CreateGroupStudentInput = {
                student_id: parseInt(key),
                group_id: group.id,
                incident_count: groupedStudents[key].length
              }

              const groupStudent = new GroupStudent();
              groupStudent.prepareToCreate(createGroupStudentInput);
              await this.groupStudentRepository.save(groupStudent);
            }
        }
        //save metadata to group table
        await this.groupRepository.update(
          group.id,
          {
            run_at: moment().format(),
            student_count: studentCountForGroup
          }
        )
      });
      response.send({message:'Group filter ran successfully'});
    }
    catch (error) {
      throw error;
    }    
  } 
}




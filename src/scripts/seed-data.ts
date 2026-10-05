import { NodeType } from '../models/node.model';
import { Role } from '../models/user.model';

export interface SeedNode {
  name: string;
  type: NodeType;
  children?: SeedNode[];
}


export const tree: SeedNode = {
  name: 'Srbija', type: 'office', children: [
    { name: 'Vojvodina', type: 'office', children: [
      { name: 'Severnobacki okrug', type: 'office', children: [
        { name: 'Subotica', type: 'office', children: [
          { name: 'Radnja 1', type: 'store' },
        ] },
      ] },
      { name: 'Juznobacki okrug', type: 'office', children: [
        { name: 'Novi Sad', type: 'office', children: [
          { name: 'Detelinara', type: 'office', children: [
            { name: 'Radnja 2', type: 'store' },
            { name: 'Radnja 3', type: 'store' },
          ] },
          { name: 'Liman', type: 'office', children: [
            { name: 'Radnja 4', type: 'store' },
            { name: 'Radnja 5', type: 'store' },
          ] },
        ] },
      ] },
    ] },
    { name: 'Grad Beograd', type: 'office', children: [
      { name: 'Novi Beograd', type: 'office', children: [
        { name: 'Bezanija', type: 'office', children: [
          { name: 'Radnja 6', type: 'store' },
        ] },
      ] },
      { name: 'Vracar', type: 'office', children: [
        { name: 'Neimar', type: 'office', children: [
          { name: 'Radnja 7', type: 'store' },
        ] },
        { name: 'Crveni krst', type: 'office', children: [
          { name: 'Radnja 8', type: 'store' },
          { name: 'Radnja 9', type: 'store' },
        ] },
      ] },
    ] },
  ],
};

export const SEED_PASSWORD = 'password123';

export interface SeedUser {
  name: string;
  email: string;
  role: Role;
  nodeName: string;
}


export const users: SeedUser[] = [
  { name: 'Marko Markovic', email: 'manager.srbija@grocery.rs', role: 'manager', nodeName: 'Srbija' },
  { name: 'Jelena Jovanovic', email: 'manager.vojvodina@grocery.rs', role: 'manager', nodeName: 'Vojvodina' },
  { name: 'Nikola Nikolic', email: 'manager.novisad@grocery.rs', role: 'manager', nodeName: 'Novi Sad' },
  { name: 'Ana Petrovic', email: 'employee.novisad@grocery.rs', role: 'employee', nodeName: 'Novi Sad' },
  { name: 'Ivan Ilic', email: 'employee.radnja2@grocery.rs', role: 'employee', nodeName: 'Radnja 2' },
  { name: 'Milica Milic', email: 'manager.beograd@grocery.rs', role: 'manager', nodeName: 'Grad Beograd' },
  { name: 'Stefan Stefanovic', email: 'manager.novibeograd@grocery.rs', role: 'manager', nodeName: 'Novi Beograd' },
  { name: 'Jovana Jovic', email: 'employee.novibeograd@grocery.rs', role: 'employee', nodeName: 'Novi Beograd' },
  { name: 'Petar Petrovic', email: 'employee.bezanija@grocery.rs', role: 'employee', nodeName: 'Bezanija' },
  { name: 'Mina Minic', email: 'manager.radnja6@grocery.rs', role: 'manager', nodeName: 'Radnja 6' },
  { name: 'Luka Lukic', email: 'employee.radnja6@grocery.rs', role: 'employee', nodeName: 'Radnja 6' },
  { name: 'Sara Saric', email: 'manager.vracar@grocery.rs', role: 'manager', nodeName: 'Vracar' },
  { name: 'Dragan Dragic', email: 'employee.radnja8@grocery.rs', role: 'employee', nodeName: 'Radnja 8' },
];
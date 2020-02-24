process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const User = require('../models/User');
const network = require('../fabric/network');
const USER_ROLES = require('../configs/constant').USER_ROLES;
const bcrypt = require('bcryptjs');
const app = require('../app');

require('dotenv').config();

describe('GET /account/me/', () => {
  let connect;
  let query;
  let findOneUserStub;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    findOneUserStub = sinon.stub(User, 'findOne');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    findOneUserStub.restore();
  });

  it('failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get('/account/me')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('failed to query info student in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .get('/account/me')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Error');
        done();
      });
  });

  it('failed to query info student in chaincode', (done) => {
    connect.returns(null);

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .get('/account/me')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('success query info of user student', (done) => {
    connect.returns({ error: null });

    let data = JSON.stringify({
      Username: 'hoangdd',
      Fullname: 'Do Hoang',
      Info: { Avatar: 'https://google.com', Sex: 'Male', Phone: '123456789' },
      Courses: 'Blockchain101'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/account/me')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('success query info of user teacher', (done) => {
    connect.returns({ error: null });

    let data = JSON.stringify({
      Username: 'hoangdd',
      Fullname: 'Do Hoang',
      Info: { Avatar: 'https://google.com', Sex: 'Male', Phone: '123456789' },
      Courses: 'Blockchain101'
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/account/me')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('success query info of admin academy', (done) => {
    connect.returns({ error: null });

    request(app)
      .get('/account/me')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.username).equal('hoangdd');
        expect(res.body.role).equal(1);
        done();
      });
  });

  it('success query info of admin student', (done) => {
    connect.returns({ error: null });

    request(app)
      .get('/account/me')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.username).equal('hoangdd');
        expect(res.body.role).equal(3);
        done();
      });
  });
});

describe('PUT /account/me/info', () => {
  let connect;
  let query;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    updateUserInfo = sinon.stub(network, 'updateUserInfo');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    updateUserInfo.restore();
  });

  it('failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .put('/account/me/info')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        fullName: 'Trinh Van Tan',
        phoneNumber: { value: '+84 973241005', country: 'VN' },
        email: 'abc@gmail.com',
        address: 'KG',
        sex: 'Male',
        birthday: 'ABC'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('failed to query info student in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .put('/account/me/info')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        fullName: 'Trinh Van Tan',
        phoneNumber: { value: '+84 973241005', country: 'VN' },
        email: 'abc@gmail.com',
        address: 'KG',
        sex: 'Male',
        birthday: 'ABC'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Error');
        done();
      });
  });

  it('failed to query info teacher in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.TEACHER }
    });

    query.returns({ success: false, msg: 'Error' });

    request(app)
      .put('/account/me/info')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        fullName: 'Trinh Van Tan',
        phoneNumber: { value: '+84 973241005', country: 'VN' },
        email: 'abc@gmail.com',
        address: 'KG',
        sex: 'Male',
        birthday: 'ABC'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Error');
        done();
      });
  });

  it('No changes', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      Username: 'hoangdd',
      Fullname: 'Trinh Van Tan',
      Info: {
        Sex: 'Male',
        PhoneNumber: '+84 973241005',
        Email: 'abc@gmail.com',
        Address: 'KG',
        Birthday: 'ABC',
        Country: 'VN'
      }
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .put('/account/me/info')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        fullName: 'Trinh Van Tan',
        phoneNumber: { value: '+84 973241005', country: 'VN' },
        email: 'abc@gmail.com',
        address: 'KG',
        sex: 'Male',
        birthday: 'ABC'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('No changes!');
        done();
      });
  });

  it('Success', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      Username: 'hoangdd',
      Fullname: 'Trinh Van Tan',
      Info: {
        Sex: 'Male',
        PhoneNumber: '123456789',
        Email: 'abc',
        Address: 'KG',
        Birthday: 'ABC',
        Country: 'VN'
      }
    });

    query.returns({
      success: true,
      msg: data
    });

    updateUserInfo.returns({
      success: true,
      msg: 'Update success!'
    });

    request(app)
      .put('/account/me/info')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        username: 'hoangdd',
        fullName: 'Trinh Van Tan',
        phoneNumber: { value: '+84 973241005', country: 'VN' },
        email: 'bcd@gmail.com',
        address: 'KG',
        sex: 'Male',
        birthday: 'ABC'
      })
      .then((res) => {
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('Update success!');
        done();
      });
  });
});

describe('GET /account/me/mysubjects', () => {
  let connect;
  let getMySubjectStub;
  let findOneUserStub;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    getMySubjectStub = sinon.stub(network, 'query');
    findOneUserStub = sinon.stub(User, 'findOne');
  });

  afterEach(() => {
    connect.restore();
    getMySubjectStub.restore();
    findOneUserStub.restore();
  });

  it('failed connect to blockchain', (done) => {
    connect.returns(null);

    request(app)
      .get('/account/me/mysubjects')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });

  it('failed to query subject of user student in chaincode', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      error: 'Error Network'
    });

    getMySubjectStub.returns({
      success: false,
      msg: data
    });

    request(app)
      .get('/account/me/mysubjects')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('failed to query subject of user student in chaincode with role teacher', (done) => {
    findOneUserStub.yields(undefined, {
      username: 'hoangdd',
      role: USER_ROLES.TEACHER
    });

    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    let data = JSON.stringify({
      error: 'Error Network'
    });

    getMySubjectStub.returns({
      success: false,
      msg: data
    });

    request(app)
      .get('/account/me/mysubjects')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('notify user has not subject', (done) => {
    findOneUserStub.yields(undefined, {
      username: 'hoangdd',
      role: USER_ROLES.ADMIN_ACADEMY
    });

    request(app)
      .get('/account/me/mysubjects')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('You do not have subject');
        done();
      });
  });

  it('success query subjects of user student', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      SubjectID: 'INT2002',
      Name: 'C++',
      TeacherUsername: 'tantrinh',
      Students: ['1', '2']
    });

    getMySubjectStub.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/account/me/mysubjects')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('success query subjects of user teacher', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.TEACHER }
    });

    findOneUserStub.yields(undefined, {
      username: 'hoangdd',
      role: USER_ROLES.TEACHER
    });

    let data = JSON.stringify(
      {
        SubjectID: 'INT2002',
        Name: 'C++',
        TeacherUsername: 'tantrinh',
        Students: ['1', '2']
      },
      {
        SubjectID: 'INT2020',
        Name: 'Golang',
        TeacherUsername: 'tantrinh',
        Students: ['1', '2']
      }
    );

    getMySubjectStub.returns({
      success: true,
      msg: data
    });

    request(app)
      .get('/account/me/mysubjects')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('teacher cannot connect to blockchain', (done) => {
    connect.returns(null);

    findOneUserStub.yields(undefined, {
      username: 'hoangdd',
      role: USER_ROLES.TEACHER
    });

    request(app)
      .get('/account/me/mysubjects')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain');
        done();
      });
  });
});

describe('POST /account/me/createscore', () => {
  let connect;
  let createScoreStub;
  let findOneUserStub;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    createScoreStub = sinon.stub(network, 'createScore');
    findOneUserStub = sinon.stub(User, 'findOne');
  });

  afterEach(() => {
    connect.restore();
    createScoreStub.restore();
    findOneUserStub.restore();
  });

  it('success create score', (done) => {
    findOneUserStub.yields(undefined, { username: 'tantrinh' });
    createScoreStub.returns({
      success: true,
      msg: 'create score success'
    });

    request(app)
      .post('/account/me/createscore')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        subjectId: '123',
        studentUsername: 'tantrinh',
        scoreValue: '9.0'
      })
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success create score', (done) => {
    findOneUserStub.yields(undefined, { username: 'tantrinh' });

    request(app)
      .post('/account/me/createscore')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .send({
        subjectId: '123',
        studentUsername: 'tantrinh',
        scoreValue: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied create score with role student ', (done) => {
    findOneUserStub.yields(undefined, { username: 'tantrinh' });

    request(app)
      .post('/account/me/createscore')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        subjectId: '123',
        studentUsername: 'tantrinh',
        scoreValue: '9.0'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied create score with role admin academy ', (done) => {
    findOneUserStub.yields(undefined, { username: 'tantrinh' });

    request(app)
      .post('/account/me/createscore')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        subjectId: '123',
        studentUsername: 'tantrinh',
        scoreValue: '9.0'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('permission denied create score with role admin student ', (done) => {
    findOneUserStub.yields(undefined, { username: 'tantrinh' });

    request(app)
      .post('/account/me/createscore')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .send({
        subjectId: '123',
        studentUsername: 'tantrinh',
        scoreValue: '9.0'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

describe('GET /account/me/certificates', () => {
  let connect;
  let query;
  let findOneUserStub;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    findOneUserStub = sinon.stub(User, 'findOne');
    query.withArgs('GetMyCerts');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    findOneUserStub.restore();
  });

  it('success query certificates of user student', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'hoangdd', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      CertificateID: 'A354',
      SubjectID: 'INT-2019',
      StudentUsername: 'tanbongcuoi',
      IssueDate: '10-10-2019'
    });

    query.returns({
      success: true,
      msg: data
    });
    request(app)
      .get('/account/me/certificates')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('alert are not student when user teacher query', (done) => {
    findOneUserStub.yields(undefined, {
      username: 'hoangdd',
      role: USER_ROLES.TEACHER
    });

    request(app)
      .get('/account/me/certificates')
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        // expect(res.status).equal(200);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('alert are not student when user admin student', (done) => {
    findOneUserStub.yields(undefined, {
      username: 'hoangdd',
      role: USER_ROLES.ADMIN_STUDENT
    });
    request(app)
      .get('/account/me/certificates')
      .set('authorization', `${process.env.JWT_ADMIN_STUDENT_EXAMPLE}`)
      .then((res) => {
        // expect(res.status).equal(200);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });

  it('alert are not student when user admin academy', (done) => {
    findOneUserStub.yields(undefined, {
      username: 'hoangdd',
      role: USER_ROLES.ADMIN_ACADEMY
    });
    request(app)
      .get('/account/me/certificates')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .then((res) => {
        // expect(res.status).equal(200);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied');
        done();
      });
  });
});

describe('GET /account/me/:subjectId/students', () => {
  let connect;
  let query;
  let findOneStub;
  let subjectID = '7';

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    findOneStub = sinon.stub(User, 'findOne');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    findOneStub.restore();
  });

  it('success query students of subject', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });
    connect.returns({ error: null });
    let students = JSON.stringify([{ username: 'tantrinh' }, { username: 'nghianv' }]);
    let scores = JSON.stringify([
      {
        SubjectID: '7',
        StudentUsername: 'tantrinh',
        scoreValue: 10.0
      }
    ]);
    query.onFirstCall().returns({ success: true, msg: students });
    query.onSecondCall().returns({ success: true, msg: scores });
    request(app)
      .get(`/account/me/${subjectID}/students`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);
        done();
      });
  });

  it('do not success because failed to call GetStudentsBySubject function', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });
    connect.returns({ error: null });
    let scores = JSON.stringify([
      {
        SubjectID: '7',
        StudentUsername: 'tantrinh',
        scoreValue: 10.0
      }
    ]);
    query.onFirstCall().returns({ success: false, msg: [] });
    query.onSecondCall().returns({ success: true, msg: scores });
    request(app)
      .get(`/account/me/${subjectID}/students`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Error when call chaincode');
        done();
      });
  });

  it('do not succes because failed to call GetScoresBySubject function', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });

    let students = JSON.stringify([{ username: 'tantrinh' }, { username: 'nghianv' }]);
    query.onFirstCall().returns({ success: true, msg: students });
    query.onSecondCall().returns({ success: false, msg: [] });
    request(app)
      .get(`/account/me/${subjectID}/students`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Error when call chaincode');
        done();
      });
  });

  it('list students return null', (done) => {
    findOneStub.yields(undefined, { username: 'hoangdd', role: USER_ROLES.TEACHER });

    let students = JSON.stringify([{ username: 'tantrinh' }, { username: 'nghianv' }]);
    let scores = JSON.stringify(null);

    query.onFirstCall().returns({ success: true, msg: students });
    query.onSecondCall().returns({ success: true, msg: scores });
    request(app)
      .get(`/account/me/${subjectID}/students`)
      .set('authorization', `${process.env.JWT_TEACHER_EXAMPLE}`)
      .then((res) => {
        expect(res.status).equal(200);
        expect(res.body.success).equal(true);

        done();
      });
  });
});

describe('POST /account/me/changePassword', () => {
  let findOneUserStub;
  let hashPass;
  let compareHash;

  beforeEach(() => {
    findOneUserStub = sinon.stub(User, 'findOne');
    hashPass = sinon.stub(bcrypt, 'hash');
    compareHash = sinon.stub(bcrypt, 'compare');
  });

  afterEach(() => {
    findOneUserStub.restore();
    hashPass.restore();
    compareHash.restore();
  });

  it('do not success change password because length < 6', (done) => {
    request(app)
      .post('/account/me/changePassword')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        oldPass: '123123',
        newPass: '12345',
        confirmPass: '12345'
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('do not success change password empty', (done) => {
    request(app)
      .post('/account/me/changePassword')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        oldPass: '',
        newPass: '12345',
        confirmPass: '12345'
      })
      .then((res) => {
        expect(res.status).equal(422);
        done();
      });
  });

  it('do not success change password because oldPass like newPass', (done) => {
    findOneUserStub.resolves({ username: 'tantrinh' });

    request(app)
      .post('/account/me/changePassword')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        oldPass: '123123',
        newPass: '123123',
        confirmPass: '123123'
      })
      .then((res) => {
        expect(res.status).equal(400);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not success change password because confirmPass do not like newPass', (done) => {
    findOneUserStub.resolves({ username: 'tantrinh' });

    request(app)
      .post('/account/me/changePassword')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        oldPass: '123123',
        newPass: '123456',
        confirmPass: '123457'
      })
      .then((res) => {
        expect(res.status).equal(400);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('do not success because account is not exist', (done) => {
    findOneUserStub.resolves(null);

    request(app)
      .post('/account/me/changePassword')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        oldPass: '123123',
        newPass: '123456',
        confirmPass: '123456'
      })
      .then((res) => {
        expect(res.status).equal(404);
        expect(res.body.success).equal(false);
        done();
      });
  });
});

describe('POST /account/me/registerCourse', () => {
  let connect;
  let query;
  let studentRegisterCourse;

  beforeEach(() => {
    connect = sinon.stub(network, 'connectToNetwork');
    query = sinon.stub(network, 'query');
    studentRegisterCourse = sinon.stub(network, 'studentRegisterCourse');
  });

  afterEach(() => {
    connect.restore();
    query.restore();
    studentRegisterCourse.restore();
  });

  it('Validate body fail!', (done) => {
    request(app)
      .post('/account/me/registerCourse')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: ''
      })
      .then((res) => {
        expect(res.status).equal(422);
        expect(res.body.success).equal(false);
        done();
      });
  });

  it('Permission Denied!', (done) => {
    request(app)
      .post('/account/me/registerCourse')
      .set('authorization', `${process.env.JWT_ADMIN_ACADEMY_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(403);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Permission Denied!');
        done();
      });
  });

  it('Failed to connect to blockchain!', (done) => {
    connect.returns(null);
    request(app)
      .post('/account/me/registerCourse')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Failed connect to blockchain!');
        done();
      });
  });

  it('Can not query chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    query.returns({
      success: false,
      msg: 'Error'
    });

    request(app)
      .post('/account/me/registerCourse')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not query chaincode!');
        done();
      });
  });

  it('You studied this course!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      Username: 'st01',
      Courses: ['123456']
    });

    query.returns({
      success: true,
      msg: data
    });

    request(app)
      .post('/account/me/registerCourse')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('You studied this course!');
        done();
      });
  });

  it('Can not invoke chaincode!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      Username: 'st01',
      Courses: ['aaaaa']
    });

    query.returns({
      success: true,
      msg: data
    });

    studentRegisterCourse.returns({
      success: false,
      msg: 'Can not invoke chaincode!'
    });

    request(app)
      .post('/account/me/registerCourse')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.status).equal(500);
        expect(res.body.success).equal(false);
        expect(res.body.msg).equal('Can not invoke chaincode!');
        done();
      });
  });

  it('Register Successfully!', (done) => {
    connect.returns({
      contract: 'academy',
      network: 'certificatechannel',
      gateway: 'gateway',
      user: { username: 'st01', role: USER_ROLES.STUDENT }
    });

    let data = JSON.stringify({
      Username: 'st01',
      Courses: ['aaaaa']
    });

    query.returns({
      success: true,
      msg: data
    });

    studentRegisterCourse.returns({
      success: true
    });

    request(app)
      .post('/account/me/registerCourse')
      .set('authorization', `${process.env.JWT_STUDENT_EXAMPLE}`)
      .send({
        courseId: '123456'
      })
      .then((res) => {
        expect(res.body.success).equal(true);
        expect(res.body.msg).equal('Register Successfully!');
        done();
      });
  });
});

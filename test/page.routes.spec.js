var expect = require('chai').expect;
var models = require('../models');
var Page = models.Page;
var User = models.User;
var supertest = require('supertest-as-promised');
var expressPipeline = require('../app');
var agent = supertest(expressPipeline);

describe('Page route', ()=>{
  beforeEach('sync pages table', ()=>{
    return Page.sync({force:true});
  });

  beforeEach('sync user table', ()=>{
    return User.sync({force:true});
  });

  describe('get route', ()=>{
    describe('/wiki',()=>{

      it('respond with 200', ()=>{
        return agent.get('/wiki').expect(200);
      })

    })

    describe('/wiki/add',()=>{
      it('responds with 200', ()=>{
        return agent.get('/wiki/add').expect(200);
      })
    })

  })

  describe('post route', ()=>{

    describe('/wiki', ()=>{
      it('save record in db', ()=>{
        return agent
        .post('/wiki')
        .send({
          authorName: 'Joe',
          authorEmail: 'joe@yahoo.com',
          title: 'Hello',
          content: '#hello',
          tags: ['page'],
          status: 'open'
        })
        .then(()=>{
          return Page.findAll()
        })
        .then( pages =>{
          var possiblePage = pages[0];
          expect(possiblePage.title).to.equal('Hello');

        })
      })

    })

  })
})

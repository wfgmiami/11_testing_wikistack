const chai = require('chai');
const spies = require('chai-spies');
chai.use(spies);
const expect = require('chai').expect;
const Page = require('../models').Page;


describe('Page model',()=>{
  it('exists',()=>{
    expect(Page).to.be.an('object');
  })
  beforeEach('sync database',()=>{
    return Page.sync( {force: true })
  })

  var joePage, jamesPage, johnPage;
  beforeEach('put data in db', (done)=>{
    jamesPage = Page.create({
      title: 'James',
      content:'#coolguy',
      tags: ['person', 'guy']
    });

    joePage = Page.create({
      title: 'Joe',
      content:'#niceguy',
      tags: ['person', 'teacher', 'guy']
    })

    johnPage = Page.create({
      title: 'John',
      content: '#veryniceguy',
      tags: ['person', 'dog owner']
    });

    Promise.all([jamesPage, joePage, johnPage])
    .then((pages)=>{
      jamesPage = pages[0];
      joePage = pages[1];
      johnPage = pages[2];
      done();
    })
    .catch(done);


  })

  describe('Virtuals', ()=>{
    describe('route',()=>{
      it('should return based on urlTitle', ()=>{
        var page = Page.build();
        page.urlTitle = "a_title_of_story";
        expect(page.route).to.equal('/wiki/a_title_of_story');
      })
    })

    describe('renderedContent',()=>{
      it('should return value based on content with marked', ()=>{
        var page = Page.build();
        page.content = "# hello";
        expectedValue = require('marked')('# hello');
        expect(page.renderedContent).to.equal(expectedValue);
      })
    })

  })

  describe('hooks', ()=>{

    describe('beforeValidate',()=>{
      it('test', ()=>{
        var page = Page.build();
        page.title = 'a title story',
        page.content = 'a toy story',
        page.status = 'open';

        return page.save()
        .then( createdPage => {
          var expVal = createdPage.title.replace(/\s+/g, '_').replace(/\W+/g,'');
          expect(createdPage.urlTitle).to.equal(expVal);
        })

      })

    })

  })

  describe('classMethods', ()=>{
    it('should return expected pages', (done)=>{

      var personPage = Page.findByTag('person')
      .then( pages => {
        expect(pages).to.have.lengthOf(3);
      })

      var guyPage =  Page.findByTag('guy')
      .then( pages => {
        expect(pages).to.have.lengthOf(2);
      })

      Promise.all([personPage, guyPage])
      .then( () =>{
        done();
      })
      .catch(done)

    })

  })

  describe('instanceMethods', ()=>{
    describe('findSimilar', ()=>{

      it('should find other pages', (done)=>{
        jamesPage.findSimilar()
        .then( pages => {
          expect(pages).to.have.lengthOf(2);
          done();
        })
        .catch(done);
      })

    })
  })

  describe('validations',()=>{
    var page;
    beforeEach('build a page', ()=>{
      page = Page.build({
        title: 'test page',
        content: '# hello',
        tags: ['test'],
        status: 'open'
      });
    });

    it('should fail without a title', (done)=>{
      page.title = null;
      page.validate()
      .then( result => {
        expect(result.errors[0].path).to.equal('title');
        done();
      })
      .catch(done);
    })

    it('should fail with invalid status', (done)=>{
      page.status = 'bubble fights';

      page.save()
      .then( () => {
        done(new Error('save happened successfully :('));
      })
      .catch( e => {
        expect(e.message.search('enum')).to.be.greaterThan(-1);
        done();
      })
      .catch(done);

    })
  })

})

const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const ping = require('./utils/ping');

describe('Test: auth service', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
  });

  describe('Test: Get config of apikey', () => {
    it('Should get config of apikey', async () => {

    });

    it('Shouldn\'t get config of apikey because this apikey doesn\'t exist', async () => {

    });
  });

  describe('Test: Create apikey', () => {
    it('Should create apikey', async () => {

    });

    it('Shouldn\'t create apikey because it\'s already exist', async () => {

    });
  });

  describe('Test: Update apikey', () => {
    it('Should update config.name of apikey', async () => {

    });

    it('Should update config.access of apikey', async () => {

    });

    it('Should update config.attributes of apikey', async () => {

    });

    it('Should update config.allowed of apikey', async () => {

    });

    it('Shouldn\'t update config.access because wrong format', async () => {

    });

    it('Shouldn\'t update config.access because wrong service', async () => {

    });

    it('Shouldn\'t update config.attributes because wrong format', async () => {

    });

    it('Shouldn\'t update config.attributes because wrong attributes', async () => {

    });

    it('Shouldn\'t update config.allowed because wrong format', async () => {

    });
  });

  describe('Test: Delete apikey', () => {
    it('Should delete apikey', async () => {

    });

    it('Shouldn\'t delete apikey because it\'s doesn\'t exist', async () => {

    });

    it('Shouldn\'t delete apikey because it\'s the super user', async () => {

    });
  });

  describe('Test: access to auth service', () => {
    it('Should access apikey', async () => {

    });

    it('Shouldn`t access apikey because wrong api key', async () => {

    });

    it('Shouldn`t access apikey because no api key', async () => {

    });
  });
});

'use strict'

/**
 * adonis-acl
 * Copyright(c) 2017 Evgeny Razumov
 * MIT Licensed
 */

const { ServiceProvider } = require('@adonisjs/fold')
const findIndex = require('lodash/findIndex')

const WRONG_ORDER_MESSAGE = `Make sure to register acl trait after the auth trait. It should be in following order
  trait('Auth/Client')
  trait('Acl/Client')
`

class AclProvider extends ServiceProvider {
  register () {
    this.app.bind('Adonis/Acl/Role', () => {
      const Role = require('../src/Models/Role')
      Role._bootIfNotBooted()
      return Role
    })
    this.app.alias('Adonis/Acl/Role', 'Role')

    this.app.bind('Adonis/Acl/Permission', () => {
      const Permission = require('../src/Models/Permission')
      Permission._bootIfNotBooted()
      return Permission
    })
    this.app.alias('Adonis/Acl/Permission', 'Permission')

    this.app.bind('Adonis/Acl/HasRole', () => {
      const HasRole = require('../src/Traits/HasRole')
      return new HasRole()
    })

    this.app.bind('Adonis/Acl/HasPermission', () => {
      const HasPermission = require('../src/Traits/HasPermission')
      return new HasPermission()
    })

    this.app.bind('Adonis/Acl/Init', () => {
      const Init = require('../src/Middlewares/Init')
      return new Init()
    })

    this.app.bind('Adonis/Acl/Is', () => {
      const Is = require('../src/Middlewares/Is')
      return new Is()
    })

    this.app.bind('Adonis/Acl/Can', () => {
      const Can = require('../src/Middlewares/Can')
      return new Can()
    })

    this.app.bind('Adonis/Acl/Scope', () => {
      const Scope = require('../src/Middlewares/Scope')
      return new Scope()
    })

    this.app.bind('Adonis/Traits/Acl', (app) => {
      return ({ Request, traits }) => {
        const authIndex = findIndex(traits, (trait) => trait.action === 'Auth/Client')
        const aclIndex = findIndex(traits, (trait) => trait.action === 'Acl/Client')

        if (aclIndex > -1 && aclIndex < authIndex) {
          throw new Error(WRONG_ORDER_MESSAGE)
        }

        require('../src/VowBindings/Request')(Request)
      }
    })
    this.app.alias('Adonis/Traits/Acl', 'Acl/Client')
  }

  boot () {
    /**
     * Adding tags to the view, only when view provider is registered
     */
    try {
      const View = this.app.use('Adonis/Src/View')
      require('../src/ViewBindings')(View)
    } catch (error) { }
  }
}

module.exports = AclProvider

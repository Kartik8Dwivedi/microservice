/**
 * Generic service implementing the common business-logic operations on top of a
 * repository. Concrete services extend this class to inherit create/read/update/
 * delete for free, and OVERRIDE any method where they need custom rules — the
 * same way you would override a method in Java and optionally call `super`.
 *
 * The service layer is framework-agnostic (no req/res): it knows nothing about
 * Express, so it can be reused and unit-tested in isolation.
 */
class CrudService {
  /** @param {import('../Repository/crud.repository.js').default} repository */
  constructor(repository) {
    if (new.target === CrudService) {
      throw new Error('CrudService is abstract and must be extended.');
    }
    this.repository = repository;
  }

  /** @param {object} payload */
  async create(payload) {
    return this.repository.create(payload);
  }

  /** @param {string} id */
  async getById(id) {
    return this.repository.findByIdOrFail(id);
  }

  /**
   * @param {object} [filter]
   * @param {{ page?: number, limit?: number, sort?: object }} [pagination]
   */
  async list(filter = {}, pagination = {}) {
    return this.repository.findAll(filter, pagination);
  }

  /**
   * @param {string} id
   * @param {object} payload
   */
  async update(id, payload) {
    return this.repository.update(id, payload);
  }

  /** @param {string} id */
  async remove(id) {
    await this.repository.destroy(id);
    return { id };
  }
}

export default CrudService;

import CrudRepository from './crud.repository.js';
import { Resource } from '../Models/index.js';

/**
 * Concrete repository for the Resource model. Inherits all generic CRUD from
 * {@link CrudRepository} and adds Resource-specific queries here.
 */
class ResourceRepository extends CrudRepository {
  constructor() {
    super(Resource);
  }

  /** Example of a domain-specific query method. */
  async findByName(name) {
    return this.model.findOne({ name });
  }
}

export default ResourceRepository;

import { NotFoundError } from '../Utils/errors/AppError.js';

/**
 * Generic repository implementing the common CRUD operations against a Mongoose
 * model. Concrete repositories extend this class and add query methods specific
 * to their domain (e.g. `findByEmail`).
 *
 * The repository layer is the ONLY layer that talks to the database. Services
 * depend on repositories, never on Mongoose directly — this keeps the data
 * source swappable and the business logic testable.
 */
class CrudRepository {
  /** @param {import('mongoose').Model} model */
  constructor(model) {
    if (new.target === CrudRepository) {
      throw new Error('CrudRepository is abstract and must be extended.');
    }
    this.model = model;
  }

  /** @param {object} data */
  async create(data) {
    return this.model.create(data);
  }

  /** @param {string} id */
  async findById(id) {
    return this.model.findById(id);
  }

  /**
   * Like {@link findById} but throws NotFoundError when nothing matches.
   * @param {string} id
   */
  async findByIdOrFail(id) {
    const doc = await this.findById(id);
    if (!doc) throw new NotFoundError(`${this.model.modelName} not found`);
    return doc;
  }

  /** @param {object} [filter] */
  async findOne(filter = {}) {
    return this.model.findOne(filter);
  }

  /**
   * Paginated list. Returns the page of documents plus pagination metadata.
   * @param {object} [filter]
   * @param {{ page?: number, limit?: number, sort?: object }} [options]
   */
  async findAll(filter = {}, { page = 1, limit = 20, sort = { createdAt: -1 } } = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit),
      this.model.countDocuments(filter),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * @param {string} id
   * @param {object} data
   */
  async update(id, data) {
    const doc = await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new NotFoundError(`${this.model.modelName} not found`);
    return doc;
  }

  /** @param {string} id */
  async destroy(id) {
    const doc = await this.model.findByIdAndDelete(id);
    if (!doc) throw new NotFoundError(`${this.model.modelName} not found`);
    return doc;
  }
}

export default CrudRepository;

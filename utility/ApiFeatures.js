

class ApiFeatures {
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    filter(){

        let queryString = JSON.stringify(this.queryStr);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        let queryObj = JSON.parse(queryString);

        // excluding fields
        const excludeFields = ['sort', 'limit', 'page'];
        excludeFields.forEach((el) => delete queryObj[el]);

        this.query = this.query.find(queryObj);
        return this;
    }

    sort(){
        if (this.queryStr.sort){
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else{
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    paginate(){
        const page = this.queryStr.page * 1 || 1;
        const limit = this.queryStr.limit * 1 || 20;
        this.query = this.query.skip((page-1) * limit).limit(limit);

        return this;
    }

};

module.exports = ApiFeatures;
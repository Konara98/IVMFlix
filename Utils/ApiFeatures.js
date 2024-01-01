class ApiFeatures{
    constructor(query, queryStr, excludeFields, movieCount){
        this.query = query;
        this.queryStr = queryStr;
        this.excludeFields = excludeFields;
        this.movieCount = movieCount;
    }

    filter(){
        const excludedQueryObj = {...this.queryStr};
        this.excludeFields.forEach((el) => {
            delete excludedQueryObj[el];
        })

        let queryString = JSON.stringify(excludedQueryObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        const queryObj = JSON.parse(queryString);

        this.query = this.query.find(queryObj);
        return this;
    }
    
    sort(){
        if(this.queryStr.sort){
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else{
            this.query = this.query.sort('-releaseDate');
        }

        return this;
    }
    
    limitFields(){
        if(this.queryStr.fields){
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }

        return this;
    }
     
    paginate(){
        const page = this.queryStr.page || 1;
        const limit = this.queryStr.limit || 10;
        const skip = (page - 1)*limit;
        this.query = this.query.skip(skip).limit(limit);

        if(this.queryStr.page){
            if(skip >= this.movieCount){
                throw new Error("This page is not found!");
            }
        }

        return this;
    }
    
}

module.exports = ApiFeatures;
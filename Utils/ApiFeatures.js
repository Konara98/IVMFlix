/**
 * Define a class for handling API features such as filtering, sorting, limiting fields, and pagination.
 */
class ApiFeatures{
    constructor(query, queryStr, excludeFields, movieCount){
        this.query = query;
        this.queryStr = queryStr;
        this.excludeFields = excludeFields;
        this.movieCount = movieCount;
    }

    //Method to filter the query based on query parameters.
    filter(){
        const excludedQueryObj = {...this.queryStr};        // Create a copy of the query parameters to exclude specific fields.
        this.excludeFields.forEach((el) => {                // Remove excluded fields from the copied query parameters.
            delete excludedQueryObj[el];
        })

        let queryString = JSON.stringify(excludedQueryObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        const queryObj = JSON.parse(queryString);

        this.query = this.query.find(queryObj);
        return this;
    }
    
    // Method to sort the query based on the 'sort' query parameter.
    sort(){
        if(this.queryStr.sort){
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else{
            this.query = this.query.sort('-releaseDate');
        }

        return this;
    }
    
    //Method to limit the fields returned in the query based on the 'fields' query parameter.
    limitFields(){
        if(this.queryStr.fields){
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }

        return this;
    }
     
    // Method to paginate the query based on the 'page' and 'limit' query parameters.
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
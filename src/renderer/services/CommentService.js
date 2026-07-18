class CommentService{

    static getLastJournal(issue){

        if(!issue.journals)
            return null;

        if(issue.journals.length===0)
            return null;

        return issue.journals.at(-1);

    }

    static hasComment(journal){

        return journal.notes &&
               journal.notes.trim().length>0;

    }

}